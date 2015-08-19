package spark.ibm.zeppelin.util.websocket.output;

// The Java bean class for String message of websocket.
public class Message extends WebsocketOutput {
	private static String TYPE = "MESSAGE";
	protected String message;

	public Message(String noteID, String paragraphID, String message) {
		super(noteID, paragraphID, TYPE);
		this.message = message;
	}

	public String getMessage() {
		return message;
	}

}
