<template>
  <div>
    <div class="hello" ref="chartDiv" id="chartDiv" v-bind:class="{ shrinked : showCompaniesMenu}">
    </div>
    <transition name="slide-fade">
      <div class="books-menu-container" >
        <CompaniesMenu :country="selectedCountry" 
                      v-if="showCompaniesMenu" 
                      v-on:companySelected="drawCompanyInfo"
                      v-on:closing="closeMenu" />
      </div>
    </transition>
  </div>
</template>

<script>
/* eslint-disable */ 
import CompaniesMenu from "./CompaniesMenu";
import dataProvider from "@/helpers/data";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";


am4core.useTheme(am4themes_animated);

export default {
  name: 'Home',
  components: {
    CompaniesMenu
  },
  data() {
    return {
      showCompaniesMenu: false,
      selectedCountry: '',
    }
  },
  mounted() {
    this.createMap();
  },
  methods: {

    showMenu(country) {
      this.selectedCountry = country;
      this.showCompaniesMenu = true;
    },

    drawCompanyInfo(linkedCountries, selectedCountry) {
      this.clearLinesAndLinkedCountires();
      let lines = linkedCountries.map(l => {
        return [selectedCountry.location, l.location];
      });
      dataProvider
        .getCountryCodesByNames(linkedCountries.map(l => { return l.name;}))
          .then(codes => {
            let excludedCurrent = codes.filter(e => e !== this.selectedCountryCode);
            this.markSelectedCountries(excludedCurrent,"#c1229a");
            this.addLinkes(lines);
          })
          .catch(err =>  {
            let codes = linkedCountries.map(l => { return l.code;});
            let excludedCurrent = codes.filter(e => e !== this.selectedCountryCode);
            this.markSelectedCountries(excludedCurrent,"#c1229a");
            this.addLinkes(lines);
          });
    },

    addLinkes(lines) {
      let lineSeries = this.map.series.push(new am4maps.MapLineSeries());
      lineSeries.mapLines.template.line.stroke = am4core.color("#a710d1");
      lineSeries.mapLines.template.line.strokeOpacity = 0.8;
      lineSeries.mapLines.template.line.strokeWidth = 2;
      lineSeries.data = [{
        "multiGeoLine": lines
      }];
    },
    
    closeMenu(e){
      this.clearMap();
      this.showCompaniesMenu = false;
    },

    clearMap() {
      while (this.map.series.length > 1) {
        this.map.series.removeIndex(1);
      }
    },
    clearLinesAndLinkedCountires() {
      while (this.map.series.length > 2) {
        this.map.series.removeIndex(2);
      }
    },

    createMap() {
        let map = am4core.create(this.$refs.chartDiv, am4maps.MapChart);
        // Set map definition
        map.geodata = am4geodata_worldLow;
        // Set projection
        map.projection = new am4maps.projections.Miller();
        this.createPolygonSeries(map);
        this.map = map;
    },

    createPolygonSeries(map) {
      let polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
      polygonSeries.useGeodata = true;
      // Configure series
      let polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipText = "{name}";
      polygonTemplate.fill = am4core.color("#7b9fd8");

      // Create hover state and set alternative fill color
      let hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color("#2568d1");

      polygonTemplate.events.on("hit", (ev) => {
        // zoom to an object
        //ev.target.series.chart.zoomToMapObject(ev.target);
        this.clearMap();
        let country = ev.target.dataItem.dataContext.name;
        this.markSelectedCountry(ev.target.dataItem.dataContext.id, "#2568d1");
        this.selectedCountryCode = ev.target.dataItem.dataContext.id;
        this.showMenu(country);
      });
      this.polygonSeries = polygonSeries;
    },

    markSelectedCountry(id, color) {
      let polygonSeries = this.map.series.push(new am4maps.MapPolygonSeries());
      let polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.fill = am4core.color(color);
      polygonSeries.useGeodata = true;
      polygonSeries.include = [id];
    },

    markSelectedCountries(ids, color) {
      let polygonSeries = this.map.series.push(new am4maps.MapPolygonSeries());
      let polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipText = "{name}";
      polygonTemplate.events.on("hit", (ev) => {
        // zoom to an object
        //ev.target.series.chart.zoomToMapObject(ev.target);
        this.clearMap();
        let country = ev.target.dataItem.dataContext.name;
        this.markSelectedCountry(ev.target.dataItem.dataContext.id, "#2568d1");
        this.selectedCountryCode = ev.target.dataItem.dataContext.id;
        this.showMenu(country);
      });
      polygonTemplate.fill = am4core.color(color);
      polygonSeries.useGeodata = true;
      let hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color("#2568d1");
      polygonSeries.include = ids;
    }
  }
 
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#chartDiv {
  width: 100%;
  height: 95vh;
}

#chartDiv.shrinked {
  width: 75%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  opacity: 0;
}
</style>
