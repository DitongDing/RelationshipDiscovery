package spark.ibm.zeppelin.util.websocket.output;

import spark.ibm.zeppelin.util.bean.table.RelationTuple;

public class RelationshipOutput extends WebsocketOutput {
	private static String TYPE = "RELATIONSHIP";
	protected RelationTuple relationTuple;

	public RelationshipOutput(String noteID, String paragraphID, RelationTuple relationTuple) {
		super(noteID, paragraphID, TYPE);
		this.relationTuple = relationTuple;
	}

	public RelationTuple getRelationTuple() {
		return relationTuple;
	}

}
