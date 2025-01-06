using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;


namespace multisnake_server
{
    /// <summary>
    /// Represents a server that handles frontend and controller connections.
    /// </summary>
    public class Server
    {
        List<FrontendHandler> frontends = new List<FrontendHandler>();      //lists of all currently connected frontends

        /// <summary>
        /// Runs the frontend server and listens for incoming connections.
        /// This method should run in its own thread.
        /// </summary>
        public void runFrontendServer()
        {
            Console.WriteLine("Listening for frontends...");
            HttpListener listener = new HttpListener();
            listener.Prefixes.Add("http://localhost:8000/");
            listener.Start();


            while (true)
            {
                HttpListenerContext context = listener.GetContext();
                if (context.Request.IsWebSocketRequest)
                {
                    processWebSocketRequest(context);
                }
                else
                {
                    context.Response.StatusCode = 400;
                    context.Response.Close();
                }
            }
        }

        /// <summary>
        /// Processes the WebSocket request and initializes a new frontend handler.
        /// </summary>
        /// <param name="context">The HTTP listener context.</param>
        private async void processWebSocketRequest(HttpListenerContext context)
        {
            HttpListenerWebSocketContext webSocketContext = await context.AcceptWebSocketAsync(null);
            WebSocket socket = webSocketContext.WebSocket;
            FrontendHandler frontendController = new FrontendHandler(socket, generateID());
            lock (frontends)
            {
                frontends.Add(frontendController);
            }
            frontendController.OnDisconnect += FrontendController_OnDisconnect;
            frontendController.sendID();
        }

        /// <summary>
        /// Event handler for frontend disconnections. Removes the disconnected frontend from the list.
        /// </summary>
        /// <param name="frontend">The disconnected frontend handler.</param>
        private void FrontendController_OnDisconnect(FrontendHandler frontend)
        {
            lock (frontends)
            {
                frontends.Remove(frontend);
            }
        }


        /// <summary>
        /// Runs the controller server and listens for incoming connections from controllers.
        /// This method should run in its own thread.
        /// </summary>
        public void runControllerServer()
        {
            Console.WriteLine("Listening for controllers...");
            TcpListener listenerController;
            try
            {
                listenerController = new TcpListener(IPAddress.Any, 8001);
                listenerController.Start();

                while (true)
                {
                    TcpClient client = listenerController.AcceptTcpClient();
                    new Thread(() => assignController(client)).Start();
                }

            }
            catch (Exception)
            {
            }
        }

        /// <summary>
        /// Assigns a controller to a frontend based on the received ID.
        /// </summary>
        /// <param name="client">The TCP client representing the controller connection.</param>
        private void assignController(TcpClient client)
        {
            try
            {
                Stream stream = client.GetStream();
                byte[] data = new byte[32];
                stream.ReadExactly(data, 0, data.Length);
                string id = ASCIIEncoding.ASCII.GetString(data);
                FrontendHandler? frontend = getFrontendByID(id);
                if (frontend != null)
                {
                    frontend.assignController(client);
                }
                else
                {
                    client.Close();
                }
            }
            catch (Exception)
            {
            }

        }

        /// <summary>
        /// Retrieves a frontend handler from the list based on the provided ID.
        /// </summary>
        /// <param name="id">The ID of the frontend handler to retrieve.</param>
        /// <returns>The frontend handler, or null if not found.</returns>
        private FrontendHandler? getFrontendByID(string id)
        {
            lock (frontends)
            {
                foreach (FrontendHandler frontend in frontends)
                {
                    if (frontend.id == id)
                    {
                        return frontend;
                    }
                }
            }
            return null;
        }

        /// <summary>
        /// Generates a unique ID for a frontend handler.
        /// </summary>
        /// <returns>A unique ID.</returns>
        private string generateID()
        {
            string id;
            do
            {
                id = generateString(32);
            } while (getFrontendByID(id) != null);
            return id;
        }

        /// <summary>
        /// Generates a random string of the specified length.
        /// </summary>
        /// <param name="length">The length of the generated string.</param>
        /// <returns>The generated string.</returns>
        private string generateString(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            Random random = new Random();
            StringBuilder stringBuilder = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                int index = random.Next(chars.Length);
                stringBuilder.Append(chars[index]);
            }

            return stringBuilder.ToString();
        }
    }
}
