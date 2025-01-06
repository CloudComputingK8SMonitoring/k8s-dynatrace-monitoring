using multisnake_server;

class Program
{
    static void Main(string[] args)
    {
        //The main method only creates a new Server Object, and runs the FrontendServer
        //and the ControllerServer in different threads
        Server server = new Server();
        new Thread(server.runFrontendServer).Start();
        server.runControllerServer();
    }
}
