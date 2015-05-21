// 沪深300 和中证500 指数
var csi300Current = 0;
var zz500Current = 0;

var csi300Previous = 1;
var zz500Previous = 1;

var csi300Increase = 0;
var zz500Increase = 0;

// 计算 current 相比 previous 增长百分比
function increasePercent(previous, current) {
	return (current / previous - 1) * 100;
}

// 获取指数当前价格
function getCurrentQuote() {
	$.ajax({
		url: 'http://hq.sinajs.cn/list=sh000300,sh000905',
		async: false,
		success: function (data) {
			var arr = data.split('\n');
			csi300Current = parseFloat(arr[0].split(',')[3]);
			zz500Current = parseFloat(arr[1].split(',')[3]);
		},
		error: function(xhr, errType, error) {
			alert("Failed to get current index quote.");
		}
	});
}

function getQuoteFromYahoo(stock, callback) {
	var today = new Date();
	// 考虑到放假可能有一周时间不开盘，为确保能找到过去 4 周的收盘数据，从当前时间起往回 6 周
	// Date 可以用 milisecond 构造，所以将当前时间减去 6 周对应的 milisecond 数
	var startDate = new Date(today - 6*7*24*60*60*1000);
	var baseUrl = 'http://real-chart.finance.yahoo.com/table.csv?s=';
	var weeklyQuoteUrl = [
		baseUrl, stock,
		'&a=', startDate.getMonth(),
		'&b=', startDate.getDate(),
		'&c=', startDate.getFullYear(),
		'&d=', today.getMonth(),
		'&e=', today.getDate(),
		'&f=', today.getFullYear(),
		'&g=w&ignore=.csv'
	].join('');

	$.ajax({
		url: weeklyQuoteUrl,
		async: false,
		success: function (data) {
			// 获取 4 周前的收盘价
			var weekQuote = data.split('\n')[4];
			callback(parseFloat(weekQuote.split(',')[4]));
		},
		error: function(xhr, errType, error) {
			alert("Failed to get previous index quote for " + stock);
		}
	});
}

// 获取指数往前 4 周时的收盘价（本周也算在内）
function getPreviousQuote() {
	getQuoteFromYahoo('000300.SS', function(price) {
		csi300Previous = price;
	});
	// Yahoo 没有中证 500 指数的历史数据
	getQuoteFromYahoo('000905.SS', function(price) {
		zz500Previous = price;
	});
}

function calculateIncrease() {
	csi300Increase = increasePercent(csi300Previous, csi300Current);
	zz500Increase = increasePercent(zz500Previous, zz500Current);
}

function updateUI() {
	// 更新页面指数当前价格
	$('#csi300Current').text(csi300Current.toFixed(2));
	$('#zz500Current').text(zz500Current.toFixed(2));

	// 更新页面指数过去价格
	$('#csi300Previous').text(csi300Previous.toFixed(2));
	$('#zz500Previous').text(zz500Previous.toFixed(2));

	// 更新指数增幅
	$('#csi300Increase').text(csi300Increase.toFixed(2) + '%');
	$('#zz500Increase').text(zz500Increase.toFixed(2) + '%');

	// 更新选择指数，高亮指数所在行
	if (zz500Increase > csi300Increase) {
		console.log("select zz500");
		$('#zz500Tr').addClass('am-danger');
		$('#csi300Tr').removeClass('am-danger');
		$('#next28').text('中证 500 指数');
	} else {
		console.log("select csi300");
		$('#csi300Tr').addClass('am-danger');
		$('#zz500Tr').removeClass('am-danger');
		$('#next28').text('沪深 300 指数');
	}
}

// 获取数据，计算涨幅，选择下一周的指数
function selectNext28() {
	getCurrentQuote();
	calculateIncrease();
	updateUI();
}

// 当页面元素加载完毕
$(document).ready(function() {
	// 只需执行一次
	getPreviousQuote();

	selectNext28();

	$('#refresh').click(function() {
		selectNext28();
	});
});
