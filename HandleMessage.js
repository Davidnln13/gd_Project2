class HandleMessage
{
  handle(evt)
  {
      try
      {
        var message = JSON.parse(evt.data)
        if ( message["type"] === "updateState")
        {
          gameNs.otherPlayer.updateFromNet(message["data"].x, message["data"].y);
          gameNs.game.updateLocalState(message["data"]);
        }
        console.log(evt.data);
      }
      catch (e)
      {
        console.log(evt.data);
      }
   }
}
