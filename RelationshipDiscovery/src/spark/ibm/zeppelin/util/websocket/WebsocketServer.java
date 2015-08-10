package spark.ibm.zeppelin.util.websocket;

import java.net.InetSocketAddress;
import java.util.LinkedList;
import java.util.StringTokenizer;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

public class WebsocketServer extends WebSocketServer {
	private static final String DEFAULT_ADDR = "0.0.0.0";
	private static final int DEFAULT_PORT = 820;

	private LinkedList<WebSocket> connectedSockets = new LinkedList<WebSocket>();

	public WebsocketServer() {
		super(new InetSocketAddress(DEFAULT_ADDR, DEFAULT_PORT));
	}

	public WebsocketServer(String address, int port) {
		super(new InetSocketAddress(address, port));
	}

	public void broadcast(String message) {
		for (WebSocket socket : connectedSockets)
			socket.send(message);

	}

	@Override
	public void onClose(WebSocket arg0, int arg1, String arg2, boolean arg3) {
		System.out.println("Close DDT_Websocket connection to " + arg0.getRemoteSocketAddress().getHostName() + ":" + arg0.getRemoteSocketAddress().getPort());
		synchronized (connectedSockets) {
			connectedSockets.remove(arg0);
		}
	}

	@Override
	public void onError(WebSocket arg0, Exception arg1) {
		// Do nothing now
	}

	@Override
	public void onMessage(WebSocket arg0, String arg1) {
		// Do nothing now
	}

	@Override
	public void onOpen(WebSocket arg0, ClientHandshake arg1) {
		System.out.println("New DDT_Websocket connection from " + arg0.getRemoteSocketAddress().getHostName() + ":" + arg0.getRemoteSocketAddress().getPort());
		synchronized (connectedSockets) {
			connectedSockets.add(arg0);
		}
	}

	// used for parse resource descriptor in ClientHandshake to get parameter
	@SuppressWarnings("unused")
	private String getParameter(String resourceDescriptor, String name) {
		String result = null;

		StringTokenizer st = new StringTokenizer(resourceDescriptor, "/&?");
		while (st.hasMoreTokens()) {
			String pair = st.nextToken();
			if (pair.startsWith(name)) {
				result = pair.substring(name.length() + 1);
				break;
			}
		}

		return result;
	}
}
