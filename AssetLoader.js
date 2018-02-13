class AssetLoader
{
  constructor()
  {
    this.data = {};
    this.request = new XMLHttpRequest();
    this.request.open('GET', './Resources/Data.json');
    this.request.send();
    this.request.addEventListener("load", this.loadData.bind(this));
  }

  loadData()
  {
    this.data = JSON.parse(this.request.responseText);

    gameNamespace.dataLoaded = true;

    gameNamespace.game.initWorld();
  }

}
