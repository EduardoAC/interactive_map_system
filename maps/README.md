# Iteractive Map Folder system
## Folders Structure
- Maps/ : it will store all the maps availables to use including countries and cities
-- Maps/Countries: contains country maps with the specific information of each country based in ISO ALPHA-3 code
--- Maps/Countries/{ISO-ALPHA-3}: contains all the information for code country as cities and politican divisions

# Create your own map


## Creation of a new map set

You need to use [Geospatial Data Abstraction Library - GDAL](http://www.gdal.org/) 
to translate the maps from [Natural Earth](http://www.naturalearthdata.com) 

Adittionally we will need Topojson to translate from geoJSON output to topojson format. Topojson CLI requires [node.js](http://nodejs.org/download/)

For a complete description follow the Tom Noda explanation in ["Interactive Map with d3.js"](http://www.tnoda.com/blog/2013-12-07).


## Integration with this library

1. Create a country file in maps/countries with {ISO-ALPHA-3} code, example Unites States have USA code then the folder will be maps/countries/usa
2. Create politics division for the country called "country_divisions.topo.json".
3. Create cities locations for the country called "country_cities.topo.json"

Then you will be ready to use your created country in the library.

NOTE: Remember the library will load the map BE AWARE THE MAP SIZE to reduce client penalizations.

NOTE2: I will encourage you to create a pull request with this new map to extend this library.
