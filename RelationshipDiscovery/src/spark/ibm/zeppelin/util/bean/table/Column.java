package spark.ibm.zeppelin.util.bean.table;

public class Column {
	protected String columnName;

	public Column(String columnName) {
		this.columnName = columnName;
	}

	public String getColumnName() {
		return columnName;
	}
}
