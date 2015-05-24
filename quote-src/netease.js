// 网易的数据访问会遇到 Access-Control-Allow-Origin 的问题
// stock: 0000300, 0000905
function getNWeekBeforeClose(stock, nweek, callback) {
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

	var today = new Date();
	// 放假可能有一周时间不开盘，为确保能找到过去 n 周的收盘数据，多取几周的数据
	var startDate = new Date(today - (nweek + 2) * WEEK_MILLISECOND);

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
		// 如需比较最近 n 周的涨幅，回退 n 周的收盘价和本周的收盘价进行比较
		for (var i = 0; i < nweek; i++) {
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
			alert("Fail to get previous index quote for " + stock);
		}
	});
}
