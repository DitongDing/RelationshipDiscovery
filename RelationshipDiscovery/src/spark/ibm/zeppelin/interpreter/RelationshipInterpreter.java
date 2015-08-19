package spark.ibm.zeppelin.interpreter;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.spark.sql.SQLContext;
import org.apache.zeppelin.interpreter.Interpreter;
import org.apache.zeppelin.interpreter.InterpreterContext;
import org.apache.zeppelin.interpreter.InterpreterResult;
import org.apache.zeppelin.interpreter.LazyOpenInterpreter;
import org.apache.zeppelin.interpreter.WrappedInterpreter;
import org.apache.zeppelin.interpreter.InterpreterResult.Code;
import org.apache.zeppelin.scheduler.Scheduler;
import org.apache.zeppelin.scheduler.SchedulerFactory;
import org.apache.zeppelin.spark.SparkInterpreter;

import spark.ibm.zeppelin.util.ComUtils;
import spark.ibm.zeppelin.util.RelationshipDiscovery;
import spark.ibm.zeppelin.util.bean.table.Table;
import spark.ibm.zeppelin.util.websocket.WebsocketServer;
import spark.ibm.zeppelin.util.websocket.output.TableOutput;
import spark.ibm.zeppelin.util.websocket.output.WebsocketOutput;

public class RelationshipInterpreter extends Interpreter {
	// Used for 1. create websocket connection with client and 2. sending websocket message to client side.
	private static WebsocketServer websocket = new WebsocketServer();

	static {
		Interpreter.register("relationship", "spark", RelationshipInterpreter.class.getName());
		// Start ddt_websocket service
		websocket.start();
	}

	public RelationshipInterpreter(Properties property) {
		super(property);
	}

	@Override
	public void open() {
	}

	@Override
	public void close() {
	}

	@Override
	public InterpreterResult interpret(String st, InterpreterContext interpreterContext) {
		InterpreterResult result = null;

		String noteID = interpreterContext.getNoteId();
		String paragraphID = interpreterContext.getParagraphId();
		List<Table> tables = new ArrayList<Table>();
		int count = 0;
		int MAX = Integer.MAX_VALUE;

		// Send table information to front end
		websocket.broadcast(ComUtils.toJson(new WebsocketOutput(noteID, paragraphID, "CLEAN")));
		SQLContext sqlc = getSparkInterpreter().getSQLContext();
		String[] names = sqlc.tableNames();
		for (String name : names)
			if (count++ < MAX)
				tables.add(new Table(name, sqlc.table(name)));
			else
				break;
		websocket.broadcast(ComUtils.toJson(new TableOutput(noteID, paragraphID, tables)));

		// Start searching relationship between tables. Send the message to client side when a relationship is found.
		RelationshipDiscovery.discorery(st, interpreterContext, websocket);

		result = new InterpreterResult(Code.SUCCESS);

		return result;
	}

	@Override
	public void cancel(InterpreterContext context) {
	}

	@Override
	public FormType getFormType() {
		return FormType.SIMPLE;
	}

	@Override
	public int getProgress(InterpreterContext context) {
		return 0;
	}

	@Override
	public Scheduler getScheduler() {
		return SchedulerFactory.singleton().createOrGetParallelScheduler(RelationshipInterpreter.class.getName() + this.hashCode(), 5);
	}

	@Override
	public List<String> completion(String buf, int cursor) {
		return null;
	}

	private SparkInterpreter getSparkInterpreter() {
		for (Interpreter intp : getInterpreterGroup()) {
			if (intp.getClassName().equals(SparkInterpreter.class.getName())) {
				Interpreter p = intp;
				while (p instanceof WrappedInterpreter) {
					if (p instanceof LazyOpenInterpreter) {
						p.open();
					}
					p = ((WrappedInterpreter) p).getInnerInterpreter();
				}
				return (SparkInterpreter) p;
			}
		}
		return null;
	}
}