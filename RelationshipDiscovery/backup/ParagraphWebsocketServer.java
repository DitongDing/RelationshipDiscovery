package spark.ibm.zeppelin.util.websocket;

import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.StringTokenizer;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import com.google.gson.Gson;

public class ParagraphWebsocketServer extends WebSocketServer {
	private static final String DEFAULT_ADDR = "0.0.0.0";
	private static final int DEFAULT_PORT = 820;

	private class SocketTurple {
		private String paragraphID;
		private WebSocket webSocket;

		public SocketTurple(String paragraphID, WebSocket webSocket) {
			super();
			this.paragraphID = paragraphID;
			this.webSocket = webSocket;
		}

		@Override
		public boolean equals(Object arg1) {
			if (arg1 == null || !(arg1 instanceof SocketTurple))
				return false;
			final SocketTurple obj = (SocketTurple) arg1;
			if ((paragraphID != null && paragraphID.equals(obj.paragraphID)) || (webSocket != null && webSocket.equals(obj.webSocket)))
				return true;
			return false;
		}

		@Override
		public int hashCode() {
			return paragraphID == null ? 0 : paragraphID.hashCode();
		}
	}

	private HashMap<SocketTurple, WebSocket> connectedSockets = new HashMap<SocketTurple, WebSocket>();
	@SuppressWarnings("unused")
	private Gson gson = new Gson();

	public ParagraphWebsocketServer() {
		super(new InetSocketAddress(DEFAULT_ADDR, DEFAULT_PORT));
	}

	public ParagraphWebsocketServer(String address, int port) {
		super(new InetSocketAddress(address, port));
	}

	public void sendMessage(String paragraphID, String message) {
		WebSocket socket = connectedSockets.get(new SocketTurple(paragraphID, null));
		socket.send(message);
	}

	public boolean checkConnection(String paragraphID) {
		return connectedSockets.containsKey(new SocketTurple(paragraphID, null));
	}

	@Override
	public void onClose(WebSocket arg0, int arg1, String arg2, boolean arg3) {
		System.out.println("Connection close from " + arg0.getRemoteSocketAddress().getHostName() + ":" + arg0.getRemoteSocketAddress().getPort());
		synchronized (connectedSockets) {
			connectedSockets.remove(new SocketTurple(null, arg0));
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
		String paragraphID = getParameter(arg1.getResourceDescriptor(), "paragraphID");
		if (paragraphID != null) {
			System.out.println("New connection from " + arg0.getRemoteSocketAddress().getHostName() + ":" + arg0.getRemoteSocketAddress().getPort());
			synchronized (connectedSockets) {
				connectedSockets.put(new SocketTurple(paragraphID, arg0), arg0);
			}
		}
	}

	// used for parse resource descriptor in ClientHandshake to get parameter
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
