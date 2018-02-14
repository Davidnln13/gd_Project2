from tornado import websocket, web, ioloop, httpserver
import tornado
import json

session = {}
WAITING_FOR_PLAYERS=0
GAME_IN_PROGRESS=1
game_state=WAITING_FOR_PLAYERS

class WSHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        print("Connection opened")
        print(self.request.remote_ip)
        print(self.stream.socket.getpeername()[1])
    #    player_address = str(self.request.remote_ip) + str(self.stream.socket.getpeername()[1])

    def on_message(self, message):
        msg = json.loads(message)
        if msg['type'] == "updateState":
        #if "updateState" in msg.values():
            self.send_to_other_player(message)
        elif msg["type"] == "join":
            self.join()
        elif msg["type"] == "gameOver":
            self.gameOver()

    def on_close(self):
        pass

    def gameOver(self):
        if len(session) >= 1:
            game_state = WAITING_FOR_PLAYERS
            session.clear()

    def join(self):
        if len(session) < 2:
            session[self.get_player_address()] = self
            game_state = GAME_IN_PROGRESS
            self.write_message(self.format_message("GameState", str(game_state)))
        elif len(session) == 2:
            self.write_message("Error game full")

    def format_message(self, msgType, data):
        msg = {}
        msg["type"] = msgType
        msg["data"] = data
        return json.dumps(msg)


    def send_to_other_player(self, message):
        for key, value in session.items():
            if(key != self.get_player_address()):
                print("Sending message to other client: " + str(message));
                value.write_message(message)

    def get_player_address(self):
        player_address = str(self.request.remote_ip) + str(self.stream.socket.getpeername()[1])
        return player_address

app= tornado.web.Application([
        	#map the handler to the URI named "test"
            #url now being localhost:8080/wstest
        	(r'/wstest', WSHandler),
],debug=True)

if __name__ == '__main__':
        	server_port=8080
        	app.listen(server_port)
        	ioloop.IOLoop.instance().start()
