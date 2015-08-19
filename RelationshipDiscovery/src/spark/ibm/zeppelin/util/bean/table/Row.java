package spark.ibm.zeppelin.util.bean.table;

// The Java bean class for Row.
public class Row {
	protected String rowValue;

	public Row(String rowValue) {
		this.rowValue = rowValue;
	}

	public String getRowValue() {
		return rowValue;
	}
}
