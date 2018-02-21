class HandleMessage
{
  handle(evt)
  {
      try
      {
        var message = JSON.parse(evt.data)
        if ( message["type"] === "GameStart")
        {
          gameNamespace.multiplayerGameStarted = true;
        }
        if(message["type"] === "Dead")
        {
          gameNamespace.haveReceivedMessage = true;
        }
        console.log(evt.data);
      }
      catch (e)
      {
        console.log(evt.data);
      }
   }
}
