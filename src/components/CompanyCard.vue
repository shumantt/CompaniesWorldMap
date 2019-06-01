<template>
    <div class="card" v-bind:class="{selected: isSelected}" @click="select()">
        <div class="info">
            <img :src="company.image" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_TV_2015.svg/1200px-Logo_TV_2015.svg.png'"/>
        </div>
        <div class="info company-name">
            {{company.name.substring(0,33)}}
        </div>
    </div>
</template>

<script>
export default {
    name: 'CompanyCard',
    props: ['company', 'isSelected'],
    methods: {
        select() {
            this.$emit('selected');
        }
    }
}
</script>

<style scoped>
img {
    width: 70px;
    height: 100%;
}
.info {
    height: 100%;
    display: inline-block;
}

.company-name {
    padding-left: 10px;
   display: inline-block;
    vertical-align: middle;
    line-height: normal;
}

.card {
  background: #fff;
  border-radius: 2px;
  /* display: inline-block; */
  height: 80px;
  margin: 0.2rem;
  position: relative;
  width: 98%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
}

.card:hover {
    cursor: pointer;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
}

.selected {
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    background-color: #c9d8f2;
}
</style>
