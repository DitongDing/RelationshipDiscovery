package spark.ibm.zeppelin.util.websocket;

import java.io.IOException;
import java.util.Scanner;

import org.java_websocket.server.WebSocketServer;

public class TestRelationshipWebsocket {
	public static void main(String[] args) throws IOException, InterruptedException {
		WebSocketServer websocket = new WebsocketServer();
		websocket.start();
		System.out.println("websocket server start");
		Scanner scanner = new Scanner(System.in);
		while (true) {
			String line = scanner.next();
			if (line.equals("exit"))
				break;
		}
		websocket.stop();
		System.out.println("websocket server stop");
		scanner.close();
	}
}