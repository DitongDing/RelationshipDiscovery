package spark.ibm.zeppelin.util.bean.table;

// The Java bean class for RelationTuple.
public class RelationTuple {
	protected String tableName1;
	protected String columnName1;
	protected String tableName2;
	protected String columnName2;
	protected Double rate;

	public RelationTuple(String tableName1, String columnName1, String tableName2, String columnName2, Double rate) {
		this.tableName1 = tableName1;
		this.columnName1 = columnName1;
		this.tableName2 = tableName2;
		this.columnName2 = columnName2;
		this.rate = rate;
	}

	public String getTableName1() {
		return tableName1;
	}

	public String getcolumnName1() {
		return columnName1;
	}

	public String getTableName2() {
		return tableName2;
	}

	public String getcolumnName2() {
		return columnName2;
	}

	public Double getRate() {
		return rate;
	}
}
