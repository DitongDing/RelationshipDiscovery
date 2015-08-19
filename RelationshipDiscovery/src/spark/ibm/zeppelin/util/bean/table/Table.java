package spark.ibm.zeppelin.util.bean.table;

import java.util.ArrayList;
import java.util.List;

import org.apache.spark.sql.DataFrame;

// The Java bean class for Table.
public class Table {
	protected String tableName;
	protected List<Column> tableColumns;
	protected List<Row> tableRows;

	public Table(String tableName) {
		this.tableName = tableName;
		tableColumns = new ArrayList<Column>();
		tableRows = new ArrayList<Row>();
	}

	public Table(String tableName, DataFrame dataFrame) {
		this(tableName);
		for (String columnName : dataFrame.schema().fieldNames())
			tableColumns.add(new Column(columnName));
	}

	public String getTableName() {
		return tableName;
	}

	public List<Column> getTableColumns() {
		return tableColumns;
	}

	public List<Row> getTableRows() {
		return tableRows;
	}
}
