package spark.ibm.zeppelin.util.bean.table;

// The Java bean class for Column.
public class Column {
	protected String columnName;

	public Column(String columnName) {
		this.columnName = columnName;
	}

	public String getColumnName() {
		return columnName;
	}
}
