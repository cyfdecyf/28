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

function getQuoteFromNetEase(stock, callback) {
	var today = new Date();
	// 放假可能有一周时间不开盘，为确保能找到过去 N 周的收盘数据，多取几周的数据
	var startDate = new Date(today - (LOOK_BACK_N_WEEK + 2) * WEEK_MILLISECOND);

	var dailyQuoteUrl = [
		'http://quotes.money.163.com/service/chddata.html',
		"?code=", stock,
		'&start=', formatDate(startDate),
		'&end=', formatDate(today),
		'&fields=TCLOSE'
	].join('');

	// console.log(dailyQuoteUrl);

	// 价格按日期逆序排列，一行一行数据往回走，倒退 1 周，返回上周最后一个交易日的索引
	function goBack1Week(quote, start) {
		var day2 = parseDate(quote[start].split(',')[0]);
		for (var i = 1; i <= 5; i++) { // 一周最多 5 个交易日
			var day1 = parseDate(quote[start + i].split(',')[0]);
			// 往回走一天，若星期几变大，说明一定倒退了一周
			// 若天数差异 >= 7，也一定回退了一周（休市一周时星期几不会回退）
			if ((day1.getDay() >= day2.getDay()) ||
				(day2 - day1 >= WEEK_MILLISECOND)) {
				return start + i;
			}
			day2 = day1;
		}
	}

	function getClosePrice(data) {
		var quote = data.split('\n');
		var idx = 1; // 跳过第一行列说明
		// 如需比较最近 4 周的涨幅，回退 4 周的收盘价和本周的收盘价进行比较
		for (var i = 0; i < LOOK_BACK_N_WEEK; i++) {
			idx = goBack1Week(quote, idx);
			console.log("back", i, quote[idx].split(',')[0]);
		}
		return parseFloat(quote[idx].split(',')[3]);
	}

	$.ajax({
		url: dailyQuoteUrl,
		async: false,
		success: function (data) {
			callback(getClosePrice(data));
		},
		error: function(xhr, errType, error) {
			alert("Failed to get previous index quote for " + stock);
		}
	});
}

// 获取指数往前 4 周时的收盘价（本周也算在内）
function getPreviousQuote() {
	getQuoteFromNetEase('0000300', function(quote) {
		csi300.previous = quote;
	});
	getQuoteFromNetEase('0000905', function(quote) {
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
