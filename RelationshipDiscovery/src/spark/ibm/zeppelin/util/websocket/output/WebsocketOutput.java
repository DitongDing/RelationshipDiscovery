package spark.ibm.zeppelin.util.websocket.output;

public class WebsocketOutput {
	protected String noteID;
	protected String paragraphID;
	protected String type;

	public WebsocketOutput(String noteID, String paragraphID, String type) {
		super();
		this.noteID = noteID;
		this.paragraphID = paragraphID;
		this.type = type;
	}

	public String getNoteID() {
		return noteID;
	}

	public String getParagraphID() {
		return paragraphID;
	}

	public String getOutputType() {
		return type;
	}
}
