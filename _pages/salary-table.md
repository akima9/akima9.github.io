---
title: "2026 연봉 실수령액 표 (2,000만원~3억원)"
description: "2026년 연봉별 실수령액 표. 연봉 2,000만원부터 3억원까지 월 실수령액과 4대보험·소득세 공제액을 한눈에 비교하세요. 국세청 간이세액표 기준."
permalink: /salary/
---
연봉 2,000만원부터 3억원까지 **세전 월급, 공제액, 월 실수령액**을 정리한 표입니다. 본인 1명(부양가족 없음), 비과세 식대 월 20만원, 퇴직금 별도 기준이며, 연봉을 누르면 부양가족별 실수령액과 연봉 인상 효과를 볼 수 있습니다.

조건이 다르면 [실수령액 계산기](/)에서 직접 계산해 보세요.

<table class="salary-table salary-table--list">
  <thead><tr><th>연봉</th><th>세전 월급</th><th>공제액</th><th>월 실수령액</th></tr></thead>
  <tbody>
    {% assign pages = site.salary | sort: "salary" %}
    {% for p in pages %}
    <tr><td><a href="{{ p.url }}">{{ p.label }}</a></td><td>{{ p.r.monthlyGross }}</td><td>{{ p.r.totalDeduction }}</td><td><strong>{{ p.r.monthlyNet }}</strong></td></tr>
    {% endfor %}
  </tbody>
</table>

{% include salary/basis.html %}
