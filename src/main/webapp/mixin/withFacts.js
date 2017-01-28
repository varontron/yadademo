define(
	function(require) {

		return withFacts;

		function withFacts() {
      this.cycFacts = function(h) {
        var html = $(h);
        var data = yadademo.content.data[0].data;
        var diffDay = Math.round(data.med_cyc - data.med_drive)
        var diffWk  = diffDay*5;
        var diffGain = 180 - diffWk;
        html.find('#diff-day').text(diffDay);
        html.find('#diff-wk').text(diffWk);
        html.find('#diff-gain').text(diffGain);
        return html;
      }

      this.expensesFacts = function(h) {
        var html = $(h);
        var svg  = $('#expenses-viz');
        var expenses = Math.abs(svg.data('total'));
        var offsets  = Math.abs(svg.data('offset'));
        var savings  = Math.abs(svg.data('diff'));
        html.find('#expenses').text(expenses);
        html.find('#offsets').text(offsets);
        html.find('#savings').text(savings);
        return html;
      }
    }
  }
)
