<template>
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
    <!--用于吸顶显示: 默认隐藏-->
    <tab-control :titles="['流行','新款','精选']"
                @tabClick="tabClick"
                ref="tabControl01"
                class="tabctrol"
                v-show="isTabFixed"></tab-control>
    <scroll class="content"
            ref='scroll'
            :probe-tybe='3'
            @barScroll='barScroll'
            :pull-up-load='true'
            @pullingUp='loadMore'>
      <home-swiper :banners ="banners" @swiperImageLoad='swiperImageLoad' ref="hSwiper"></home-swiper>
      <recommend-view :recommends ="recommends"></recommend-view>
      <feature-view></feature-view>
      <tab-control :titles="['流行','新款','精选']"
                  @tabClick="tabClick"
                  ref="tabControl02"></tab-control>
      <good-list :goods="showGoods"></good-list>
    </scroll>
    <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>  <!--.native 监听直接组件的点击-->
  </div>
</template>

<script>
//子组件
import HomeSwiper from './childComs/HomeSwiper'
import RecommendView from './childComs/RecommendView'
import FeatureView from './childComs/FeatureView'
//公共组件
import NavBar from 'components/common/navbar/NavBar'
import TabControl from 'components/content/tabcontrol/TabControl'
import GoodList from 'components/content/goods/GoodList'
import Scroll from 'components/common/scroll/Scroll'
import BackTop from 'components/content/backtop/BackTop'
//方法
import {getHomeMultidata,getHomeGoods} from 'network/home'
import {debounce} from 'common/utils'

export default {
  name: "Home",
  components:{
    HomeSwiper,
    RecommendView,
    FeatureView,
    NavBar,
    TabControl,
    GoodList,
    Scroll,
    BackTop,
  },
  data(){
    return{
      banners: [],
      recommends:[],
      goods:{
        'pop':{page:0,list:[]},
        'new':{page:0,list:[]},
        'sell':{page:0,list:[]}
      },
      currentType:'pop',
      isShowBackTop: false,
      tabOffsetTop: 0,
      isTabFixed: false,
      saveY: 0
    }
  },
  created(){
    //由于起名相同: 使用this是调用methods中封装的方法,直接调用才是调用导入的请求函数;
    //1.请求多个数据列表
    this.getHomeMultidata();
    //2.请求商品数据
    this.getHomeGoods('pop');
    this.getHomeGoods('new');
    this.getHomeGoods('sell');
  },
  mounted(){
    //1.事件总线&bus: 监听图片加载完成事件(解决BS1.0可滑动高度不对问题; 2.0可直接使用插件)
    //调用防抖处理: 让刷新没有那么频繁
    const refresh = debounce(this.$refs.scroll.refresh,200);
    this.$bus.$on('homeImageLoad',()=>{
      refresh()
    })
  },
  //记录Home页面的状态:在离开当前路由前保存滚动的Y值,当切回当前路由时重新赋值原位置(写在computed中没有作用)
  activated(){
    this.$refs.scroll.refresh();
    this.$refs.scroll.scrollTo(0,this.saveY,10);
  },
  deactivated(){
    this.saveY = this.$refs.scroll.getScrollY();
  },
  computed:{
    showGoods(){
      return this.goods[this.currentType].list;
    }
  },
  methods:{
    //*********************事件监听相关方法**********************
    tabClick(index){
      switch(index){
        case 0:
          this.currentType = 'pop'
          break
        case 1:
          this.currentType = 'new'
          break
        case 2:
          this.currentType = 'sell'
          break
      }
      //需要显示的都与最新点击的保持一致
      this.$refs.tabControl01.currentIndex = index;
      this.$refs.tabControl02.currentIndex = index;
    },
    backClick(){
      //通过在子组件标签绑定:ref,访问子组件的方法
      this.$refs.scroll.scrollTo(0,0,500)
    },
    barScroll(position){
      //1.设置BackTop的显示与隐藏的位置
      this.isShowBackTop = -(position.y) > 1000;
      //2.设置tabControl是否吸顶
      this.isTabFixed =  -(position.y) > this.tabOffsetTop;
    },
    loadMore(){
      this.getHomeGoods(this.currentType)
    },
    swiperImageLoad(){
      //读取tabControl的offsetTop值: 所有组件都有一个属性$el用于获取组件中的元素
      this.tabOffsetTop = this.$refs.tabControl02.$el.offsetTop;
    },
    //*********************网络请求相关方法*********************
    getHomeMultidata(){
      //调用导入的请求函数获得的返回值是Promise对象
      getHomeMultidata().then(res => {
        //箭头函数自身没有this,它会查找离它最近的作用域的this; 即created的this,就是当前组件对象;
        this.banners = res.data.banner.list;
        this.recommends = res.data.recommend.list;
      })
    },
    getHomeGoods(type){
      const page = this.goods[type].page + 1;
      getHomeGoods(type,page).then(res =>{
        this.goods[type].list.push(...res.data.list);
        this.goods[type].page += 1;
        //完成此次上拉加载,BS开启下一次上拉加载作准备;
        this.$refs.scroll.finishPullUp();
      })
    }
  }
}
</script>
<style scoped>
/*scoped: 设置当前样式的作用域只在当前文件有效*/
#home{
  /*vh: 可视窗口高度*/
  height: 100vh;
  position: relative;
}
.home-nav{
  color: white;
  /*使用事先在base.css中设置的css变量*/
  background-color: var(--color-tint);
  z-index: 999;
}
.content{
  overflow: hidden;
  position: absolute;
  top: 44px;
  bottom: 49px;
  left: 0;
  right: 0;
}
.tabctrol{
  position: relative;
  z-index: 999;
}
</style>
