package spark.ibm.zeppelin.util.websocket.output;

import spark.ibm.zeppelin.util.bean.table.RelationTurple;

public class RelationshipOutput extends WebsocketOutput {
	private static String TYPE = "RELATIONSHIP";
	protected RelationTurple relationTurple;

	public RelationshipOutput(String noteID, String paragraphID, RelationTurple relationTurple) {
		super(noteID, paragraphID, TYPE);
		this.relationTurple = relationTurple;
	}

	public RelationTurple getRelationTurple() {
		return relationTurple;
	}

}
