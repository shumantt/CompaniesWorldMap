import axios from "axios";




class DataProvider {

    fetchCompaniesByCountry(country) {
        let orgsByCountryQuery = 
        ["PREFIX dcterms: <http://purl.org/dc/terms/>"
        ,"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"
        ,"PREFIX wd: <http://www.wikidata.org/entity/>"
        ,"PREFIX wdt: <http://www.wikidata.org/prop/direct/>"
        ,"PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>"
        ,"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
        ,"SELECT ?organization (SAMPLE(?orgName) as ?name) (COUNT(?subOrg) as ?subOrgCount) (SAMPLE(?img) as ?image) (SAMPLE(?logo) as ?l) (SAMPLE(?location) as ?loc)"
        ,"WHERE {"
            ,"?organization wdt:P31 ?orgType;"
                ,"rdfs:label ?orgName;"
                ,"wdt:P17 ?orgCountry;"
                ,"wdt:P355 ?subOrg."
            ,"?subOrg wdt:P17 ?subOrgCountry."
            ,"?orgCountry rdfs:label ?orgCountryLbl."
            ,"?orgCountry wdt:P625 ?location."
            ,"OPTIONAL {?organization wdt:P18 ?img}."
            ,"OPTIONAL {?organization wdt:P154 ?logo}."
            ,"FILTER(?orgType in (wd:Q4830453, wd:Q6881511, wd:Q43229))."
            ,"FILTER(?subOrgCountry != ?orgCountry)."
            ,`FILTER(contains(?orgCountryLbl,"${country}"@en)).`
            ,'FILTER(LANG(?orgName) = "en").'
            ,'FILTER(LANG(?orgCountryLbl) = "en").'
        ,"}"
        ,"GROUP BY ?organization"
        ,"ORDER BY DESC(?subOrgCount)"
        ,"LIMIT 30"
        ];

        let query = orgsByCountryQuery.join(" ");
        return new Promise((resolve, reject) => {
            axios.get("https://query.wikidata.org/sparql", {
                params: {
                  query: query,
                  format: "json"
                }
              })
              .then(r => resolve(
                  r.data.results.bindings.map(t => {
                       let img = '';
                       if (t.l) 
                            img = t.l.value;
                        else if (t.image)
                            img = t.image.value;
                        let pointValue = t.loc.value.replace("Point(", "").replace(")", "");
                        let values = pointValue.split(" ");
                        let latitude = values[1];
                        let longitude = values[0];
                       return {
                        organization: t.organization.value,
                        name: t.name.value,
                        image: img,
                        location: {"latitude" : parseFloat(latitude), "longitude": parseFloat(longitude)},
                       };
                    }))
              )
              .catch(er => reject(er));
        });
    }

    fetchSubOrgsCountries(mainOrgUri) {
        let subOrgQuery = ["PREFIX dcterms: <http://purl.org/dc/terms/>"
        ,"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"
        ,"PREFIX wd: <http://www.wikidata.org/entity/>"
        ,"PREFIX wdt: <http://www.wikidata.org/prop/direct/>"
        ,"PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>"
        ,"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
        ,"SELECT DISTINCT ?subOrgCountryLbl ?location ?code"
        ,"WHERE {"
            ,`<${mainOrgUri}> wdt:P355 ?subOrg.`
            ,"?subOrg wdt:P17 ?subOrgCountry."
            ,"?subOrgCountry rdfs:label ?subOrgCountryLbl."
            ,"?subOrgCountry wdt:P625 ?location."
            ,"?subOrgCountry wdt:P901 ?code."
            ,'FILTER(LANG(?subOrgCountryLbl) = "en").'
        ,"}"
        ];
        let query = subOrgQuery.join(" ");
        return new Promise((resolve, reject) => {
            axios.get("https://query.wikidata.org/sparql", {
                params: {
                  query: query,
                  format: "json"
                }
              })
              .then(r => resolve(r.data.results.bindings.map(t => {
                  let pointValue = t.location.value.replace("Point(", "").replace(")", "");
                  let values = pointValue.split(" ");
                  let latitude = values[1];
                  let longitude = values[0];
                  return {
                      name: t.subOrgCountryLbl.value,
                      location: {"latitude" : parseFloat(latitude), "longitude": parseFloat(longitude)},
                      code: t.code.value
                  };
                })))
              .catch(er => reject(er));
        });
    }

    getCountryCodesByNames(names) {
        return new Promise((resolve, reject) => {
            let result = [], promises = [];
        
            names.forEach(function(n){
                let url = `https://restcountries.eu/rest/v2/name/${n}`;
                promises.push(axios.get(url))
            });
            axios.all(promises).then(function(results) {
                results.forEach(function(response) {
                    result.push(response.data[0].alpha2Code);
                });
                resolve(result);
            }).catch(err => reject(err));
        });
       
    }

}

export default new DataProvider();