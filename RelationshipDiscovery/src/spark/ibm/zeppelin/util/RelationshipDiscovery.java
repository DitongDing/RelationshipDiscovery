package spark.ibm.zeppelin.util;

import org.apache.zeppelin.interpreter.InterpreterContext;

import spark.ibm.zeppelin.util.bean.table.RelationTuple;
import spark.ibm.zeppelin.util.websocket.WebsocketServer;
import spark.ibm.zeppelin.util.websocket.output.RelationshipOutput;

public class RelationshipDiscovery {
	public static void discorery(String text, InterpreterContext interpreterContext, WebsocketServer websocket) {
		String noteID = interpreterContext.getNoteId();
		String paragraphID = interpreterContext.getParagraphId();

		// TODO do real search.
		try {
			Thread.sleep(1000);
			String tableName1 = "csv";
			String columnName1 = "cc_call_center_sk";
			String tableName2 = "textfile";
			String columnName2 = "_1";
			RelationshipOutput output = new RelationshipOutput(noteID, paragraphID, new RelationTuple(tableName1, columnName1, tableName2,
					columnName2, 0.8));
			websocket.broadcast(ComUtils.toJson(output));

			Thread.sleep(1000);
			tableName1 = "csv";
			columnName1 = "cc_hours";
			tableName2 = "textfile";
			columnName2 = "_1";
			output = new RelationshipOutput(noteID, paragraphID, new RelationTuple(tableName1, columnName1, tableName2, columnName2, 0.8));
			websocket.broadcast(ComUtils.toJson(output));

			Thread.sleep(5000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
}
