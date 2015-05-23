// 沪深300 和中证500 指数
var csi300 = {
	current: 0,
	previous: 1,
	increase: 0
};

var zz500 = {
	current: 0,
	previous: 1,
	increase: 0
};

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
			csi300.current = parseFloat(arr[0].split(',')[3]);
			zz500.current = parseFloat(arr[1].split(',')[3]);
		},
		error: function(xhr, errType, error) {
			alert("Failed to get current index quote.");
		}
	});
}

// 比较最近 N 周的涨幅，则获取回退 N 周时的收盘价
var LOOK_BACK_N_WEEK = 4;
var WEEK_MILLISECOND = 7*24*60*60*1000;

function parseDate(str) {
	var parts = str.split('-');
	return new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
}

function formatDate(d) {
	var month = d.getMonth() + 1;
	if (month < 10) {
		month = [0, month].join('');
	}
	var date = d.getDate();
	if (date < 10) {
		date = [0, date].join('');
	}
	return [ d.getFullYear(), month, date ].join('');
}

// stock: sh000300, sh000905
function getNWeekBeforeClose(stock, nweek, callback) {
	var dailyQuoteUrl = [
		'http://data.gtimg.cn/flashdata/hushen/weekly/', stock, '.js'
	].join('');

	function getClosePrice(data) {
		// 周线数据按时间排序，最后一行无数据
		var weekly = data.split('\n');
		var quote = weekly[weekly.length - 2 - nweek];
		return parseFloat(quote.split(' ')[2]);
	}

	$.ajax({
		url: dailyQuoteUrl,
		async: false,
		success: function (data) {
			callback(getClosePrice(data));
		},
		error: function(xhr, errType, error) {
			alert("Fail to get previous index quote for " + stock);
		}
	});
}

// 获取指数往前 4 周时的收盘价（本周也算在内）
function getPreviousQuote() {
	getNWeekBeforeClose('sh000300', LOOK_BACK_N_WEEK, function(quote) {
		csi300.previous = quote;
	});
	getNWeekBeforeClose('sh000905', LOOK_BACK_N_WEEK, function(quote) {
		zz500.previous = quote;
	});
}

function calculateIncrease() {
	csi300.increase = increasePercent(csi300.previous, csi300.current);
	zz500.increase = increasePercent(zz500.previous, zz500.current);
}

function updateUI() {
	// 更新页面指数当前价格
	$('#csi300Current').text(csi300.current.toFixed(2));
	$('#zz500Current').text(zz500.current.toFixed(2));

	// 更新页面指数过去价格
	$('#csi300Previous').text(csi300.previous.toFixed(2));
	$('#zz500Previous').text(zz500.previous.toFixed(2));

	// 更新指数增幅
	$('#csi300Increase').text(csi300.increase.toFixed(2) + '%');
	$('#zz500Increase').text(zz500.increase.toFixed(2) + '%');

	// 更新选择指数，高亮指数所在行
	if (zz500.increase > csi300.increase) {
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
