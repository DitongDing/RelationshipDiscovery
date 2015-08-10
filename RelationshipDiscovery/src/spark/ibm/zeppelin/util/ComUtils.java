package spark.ibm.zeppelin.util;

import com.google.gson.Gson;

public class ComUtils {
	private static Gson gson = new Gson();

	public static String toJson(Object obj) {
		if (obj == null)
			return "";
		else
			return gson.toJson(obj);
	}
}
