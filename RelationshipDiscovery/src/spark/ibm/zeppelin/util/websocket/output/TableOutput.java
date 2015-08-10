package spark.ibm.zeppelin.util.websocket.output;

import java.util.List;

import spark.ibm.zeppelin.util.bean.table.Table;

public class TableOutput extends WebsocketOutput {
	private static String TYPE = "TABLE";
	protected List<Table> tables;

	public TableOutput(String noteID, String paragraphID, List<Table> tables) {
		super(noteID, paragraphID, TYPE);
		this.tables = tables;
	}

	public List<Table> getTables() {
		return tables;
	}
}