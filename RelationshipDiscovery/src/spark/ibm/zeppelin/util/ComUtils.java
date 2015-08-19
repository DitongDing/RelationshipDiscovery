package spark.ibm.zeppelin.util;

import com.google.gson.Gson;

// Contains utilities which will be used in other functions.
public class ComUtils {
	private static Gson gson = new Gson();

	// input: Object instance
	// output: Jsonlized object.
	public static String toJson(Object obj) {
		if (obj == null)
			return "";
		else
			return gson.toJson(obj);
	}
}
