using System.Globalization;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;

namespace multisnake_server
{
    /// <summary>
    /// Represents a handler for frontend connections.
    /// </summary>
    public class FrontendHandler
    {

        public delegate void FrontendDisconnected(FrontendHandler frontend);
        public event FrontendDisconnected? OnDisconnect;
        public string id;
        private WebSocket socket;
        private List<ControllerHandler> controllers = new List<ControllerHandler>();
        /// <summary>
        /// The timer that sends the current controller states to the frontend every 100ms
        /// </summary>
        private Timer timer;

        /// <summary>
        /// Indicates that the FrontendHandler is currently in the disconnecting-phase
        /// </summary>
        private bool disconnecting = false;

        /// <summary>
        /// Initializes a new instance of the FrontendHandler class.
        /// </summary>
        /// <param name="socket">The WebSocket representing the frontend connection.</param>
        /// <param name="id">The ID associated with the frontend.</param>
        public FrontendHandler(WebSocket socket, string id)
        {
            this.socket = socket;
            this.id = id;
            timer = new Timer(sendControllerStates, null, TimeSpan.Zero, TimeSpan.FromMilliseconds(100));
            new Thread(listen).Start();
        }

        /// <summary>
        /// Listens for messages from the frontend and handles them accordingly.
        /// This method runs i its own thread
        /// </summary>
        private async void listen()
        {
            try
            {
                while (true)
                {
                    byte[] buffer = new byte[1024];
                    WebSocketReceiveResult result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string message = Encoding.ASCII.GetString(buffer, 0, result.Count);
                        if (message != null)
                        {
                            if (message == "gameover")
                            {
                                //game is over
                                lock (controllers)
                                {
                                    foreach (ControllerHandler controller in controllers)
                                    {
                                        controller.disconnect();
                                    }
                                }
                            }
                            else if (message.StartsWith("died"))
                            {
                                //player died
                                string[] split = message.Split(':');
                                ControllerHandler? controller = getControllerByName(split[1]);
                                if (controller != null)
                                {
                                    controller.disconnect();
                                }
                            }
                            else
                            {
                                //if the message is neither gameover nor died,
                                //it is the current statistic of the game scores
                                lock (controllers)
                                {
                                    foreach (ControllerHandler controller in controllers)
                                    {
                                        controller.sendStatistic(message);
                                    }
                                }
                            }
                        }
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                        throw new Exception("Disconnected");
                    }
                }
            }
            catch (Exception)
            {
            }
            finally
            {
                disconnect();
            }
        }


        /// <summary>
        /// Sends the current controller states to the frontend.
        /// This method is called from the timer every 100ms
        /// </summary>
        /// <param name="state">The state object (not used).</param>
        private void sendControllerStates(object? state)
        {
            StringBuilder sb = new StringBuilder();
            lock (controllers)
            {
                for (int i = 0; i < controllers.Count; i++)
                {
                    ControllerHandler controller = controllers[i];
                    sb.Append(controller.name);
                    sb.Append(":");
                    sb.Append(controller.x.ToString(CultureInfo.InvariantCulture));
                    sb.Append(",");
                    sb.Append(controller.y.ToString(CultureInfo.InvariantCulture));
                    if (i != controllers.Count - 1)
                    {
                        sb.Append(";");
                    }
                }



            }


            send(sb.ToString());

        }

        /// <summary>
        /// Sends a message to the frontend.
        /// </summary>
        /// <param name="str">The message to send.</param>
        public async void send(string str)
        {
            if (disconnecting) return;
            if (String.IsNullOrEmpty(str))
            {
                return;
            }
            try
            {
                byte[] echoBuffer = Encoding.ASCII.GetBytes(str);
                await socket.SendAsync(new ArraySegment<byte>(echoBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
            }
            catch (Exception)
            {
                disconnect();
            }



        }

        /// <summary>
        /// Sends the generated GameID to the frontend.
        /// </summary>
        public void sendID()
        {
            send(id);
        }

        /// <summary>
        /// Assigns a controller to the frontend.
        /// </summary>
        /// <param name="client">The TCP client representing the controller connection.</param>
        public void assignController(TcpClient client)
        {
            ControllerHandler controller = new ControllerHandler(client, generateNewName(), generateNewColor());
            lock (controllers)
            {
                controllers.Add(controller);
            }
            controller.OnDisconnect += ControllerHandler_OnDisconnect;
            controller.OnReady += Controller_OnReady;
            send("registered:" + controller.name + "," + controller.color);

            controller.handleClient();
        }

        /// <summary>
        /// Event handler for when a controller is ready.
        /// </summary>
        /// <param name="controller">The ControllerHandler instance.</param>
        private void Controller_OnReady(ControllerHandler controller)
        {
            if (allReady() && controllers.Count >= 2)
            {
                lock (controllers)
                {
                    foreach (ControllerHandler con in controllers)
                    {
                        con.startGame();
                    }
                }

            }
            send("ready:" + controller.name);
        }

        /// <summary>
        /// Checks if all controllers are ready.
        /// </summary>
        /// <returns>True if all controllers are ready; otherwise, false.</returns>
        private bool allReady()
        {
            lock (controllers)
            {
                foreach (ControllerHandler controller in controllers)
                {
                    if (!controller.ready)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        /// <summary>
        /// Event handler for when a controller is disconnected.
        /// </summary>
        /// <param name="controller">The ControllerHandler instance.</param>
        private void ControllerHandler_OnDisconnect(ControllerHandler controller)
        {
            if (disconnecting) return;
            send("disconnected:" + controller.name);
            lock (controllers)
            {
                controllers.Remove(controller);
            }
        }

        /// <summary>
        /// Retrieves a controller by its name.
        /// </summary>
        /// <param name="name">The name of the controller.</param>
        /// <returns>The ControllerHandler instance, or null if not found.</returns>
        private ControllerHandler? getControllerByName(string name)
        {
            lock (controllers)
            {
                foreach (ControllerHandler controller in controllers)
                {
                    if (controller.name == name)
                    {
                        return controller;
                    }
                }
            }
            return null;
        }

        /// <summary>
        /// Generates a new unique name for a controller.
        /// </summary>
        /// <returns>A new unique name.</returns>
        private string generateNewName()
        {
            string name;
            do
            {
                name = NamesAndColors.generateName();
            } while (nameExists(name));
            return name;
        }

        /// <summary>
        /// Checks if a name already exists among the controllers.
        /// </summary>
        /// <param name="name">The name to check.</param>
        /// <returns>True if the name exists; otherwise, false.</returns>
        private bool nameExists(string name)
        {
            lock (controllers)
            {
                foreach (ControllerHandler controller in controllers)
                {
                    if (controller.name == name)
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        /// <summary>
        /// Generates a new unique color for a controller.
        /// </summary>
        /// <returns>A new unique color.</returns>
        private string generateNewColor()
        {
            string color;
            do
            {
                //the colors are not randomly generated, but are chosen from a list of
                //predefined colors to avoid choosing two indistinguishable colors.
                color = NamesAndColors.generateColor();
            } while (colorExists(color));
            return color;
        }

        /// <summary>
        /// Checks if a color already exists among the controllers.
        /// </summary>
        /// <param name="color">The color to check.</param>
        /// <returns>True if the color exists; otherwise, false.</returns>
        private bool colorExists(string color)
        {
            lock (controllers)
            {
                foreach (ControllerHandler controller in controllers)
                {
                    if (controller.color == color)
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        /// <summary>
        /// Disconnects the frontend and associated controllers.
        /// </summary>
        private void disconnect()
        {
            if (!disconnecting)
            {
                disconnecting = true;

                socket.Dispose();
                lock (controllers)
                {
                    foreach (ControllerHandler controller in controllers)
                    {
                        controller.disconnect();
                    }
                }

                if (OnDisconnect != null)
                {
                    OnDisconnect(this);
                }
            }

        }
    }


}





