<template>
     <div class="side-bar">
         <div class="close" @click="close">&#10006;</div>
         <h3 class="country">{{country}}</h3>
         <div class="loader" v-if="showLoader">Loading...</div>
         <div class="content" v-if="!showLoader">
             <CompanyCard v-for="(company,index) in companies" 
                        v-bind:key="company.organization"
                        v-on:selected="selectCompany(index)"
                        :company="company"
                        :isSelected="isSelected(index)"   />
         </div>
     </div>
</template>

<script>
import dataProvider from "@/helpers/data";
import CompanyCard from "./CompanyCard";

export default {
    name: 'CompaniesMenu',
    props: ['country'],
    components: {
        CompanyCard
    },
    data() {
        return {
            showLoader: true,
            selectedCardIndex: -1,
            companies: []
        }
    },
    mounted() {
        this.fetchCompanies();
        //this.$emit('companySelected', {coolArgs: 'coolValue'});
    },
    watch: { 
        country: function(newVal, oldVal) {
            this.selectedCardIndex = -1;
            this.fetchCompanies();
        }
    },
    methods: {
        fetchCompanies() {
            this.showLoader = true;
            dataProvider.fetchCompaniesByCountry(this.country)
                .then(
                    (companies) => {
                        this.companies = companies;
                        this.showLoader = false;
                    },
                    (err) => {
                        console.log(err);
                        this.showLoader = false;
                    }
                )
        },

        selectCompany(index) {
            this.selectedCardIndex = index;
            dataProvider.fetchSubOrgsCountries(this.companies[this.selectedCardIndex].organization)
                .then(linkedCountries => {
                        this.$emit("companySelected", linkedCountries, this.companies[this.selectedCardIndex]);
                    },
                    e => console.log(e)
                )
            //this.companies = this.companies.slice();
        },

        isSelected(index) {
            return index == this.selectedCardIndex;
        },

        close() {
            this.selectedCardIndex = -1;
            this.$emit("closing");
        }
    }
}
</script>

<style scoped>
.side-bar {
    right: 0;
    height: 100%; /* 100% Full-height */
    width: 25%; /* 0 width - change this with JavaScript */
    position: fixed; /* Stay in place */
    z-index: 1; /* Stay on top */
    top: 0; /* Stay at the top */
    background-color: #e8f0ff; /* Black*/
    overflow-x: hidden; /* Disable horizontal scroll */
    padding-top: 5px; /* Place content 60px from the top */
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    overflow: auto;
}

.country {
    padding-left: 10px;
}

.close:hover{
    cursor: pointer;
}
</style>
