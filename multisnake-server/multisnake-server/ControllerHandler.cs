using System.Globalization;
using System.Net.Sockets;


namespace multisnake_server
{

    public class ControllerHandler
    {
        public delegate void ControllerDisconnected(ControllerHandler controller);
        public delegate void ControllerReady(ControllerHandler controller);

        public event ControllerDisconnected? OnDisconnect;
        public event ControllerReady? OnReady;
        private TcpClient client;
        private Stream stream;
        private StreamReader reader;
        private StreamWriter writer;

        public string name;
        public string color;

        /// <summary>
        /// The x-coordinate of the controller's position.
        /// </summary>
        public float x = 0;
        /// <summary>
        /// The x-coordinate of the controller's position.
        /// </summary>
        public float y = 0;
        /// <summary>
        /// The controllers ready state.
        /// </summary>
        public bool ready = false;

        /// <summary>
        /// Initializes a new instance of the <see cref="ControllerHandler"/> class.
        /// </summary>
        /// <param name="client">The TCP client representing the controller connection.</param>
        /// <param name="name">The name of the controller.</param>
        /// <param name="color">The color of the controller.</param>
        public ControllerHandler(TcpClient client, string name, string color)
        {
            this.name = name;
            this.color = color;
            this.client = client;
            stream = client.GetStream();
            reader = new StreamReader(stream);
            writer = new StreamWriter(stream);
        }

        /// <summary>
        /// Sends the name and color of the controller to the client.
        /// </summary>
        public void sendNameAndColor()
        {
            writer.WriteLine(name);
            writer.WriteLine(color);
            writer.Flush();
        }

        /// <summary>
        /// Handles the client's input and events.
        /// This mehtod should run in its own thread
        /// </summary>
        public void handleClient()
        {
            try
            {
                sendNameAndColor();
                while (client.Connected)
                {
                    string? line = reader.ReadLine();
                    if (line == null)
                    {
                        throw new Exception();
                    }
                    else if (line == "ready")
                    {
                        ready = true;
                        if (OnReady != null)
                        {
                            OnReady(this);
                        }
                    }
                    else
                    {
                        string[] parts = line.Split(";");
                        x = float.Parse(parts[0], CultureInfo.InvariantCulture);
                        y = float.Parse(parts[1], CultureInfo.InvariantCulture);
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
        /// Tells the controller that the game has started
        /// </summary>
        public void startGame()
        {
            try
            {
                writer.WriteLine("gamestart");
                writer.Flush();
            }
            catch (Exception)
            {
                disconnect();
            }

        }

        /// <summary>
        /// Disconnects the controller.
        /// </summary>
        public void disconnect()
        {
            reader.Close();
            stream.Close();
            client.Close();
            if (OnDisconnect != null)
            {
                OnDisconnect(this);
            }
        }

        /// <summary>
        /// Sends a statistic message to the controller.
        /// </summary>
        /// <param name="message">The statistic message to send.</param>
        public void sendStatistic(string message)
        {
            try
            {
                writer.WriteLine(message);
                writer.Flush();
            }
            catch (Exception)
            {
                disconnect();
            }
        }
    }
}
