function agruparTransacoesPorMes(transactions) {
  const totais = {};

  transactions.forEach(t => {
    const data = new Date(t.date + "T00:00:00");
    const chave = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`;

    if (!totais[chave]) {
      totais[chave] = { receitas: 0, despesas: 0 };
    }

    if (t.type === "income") {
      totais[chave].receitas += t.amount;
    } else if (t.type === "expense") {
      totais[chave].despesas += t.amount;
    }
  });

  return totais;
}

// Gera os últimos 6 meses (incluindo o atual), mesmo que não tenham transações ainda
function gerarUltimos6Meses() {
  const meses = [];
  const hoje = new Date();

  for (let i = 5; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const chave = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`;
    meses.push(chave);
  }

  return meses;
}

function criarGraficoDesempenho(transactions) {
  const totaisPorMes = agruparTransacoesPorMes(transactions);
  const ultimos6Meses = gerarUltimos6Meses();

  const receitas = ultimos6Meses.map(chave => totaisPorMes[chave]?.receitas || 0);
  const despesas = ultimos6Meses.map(chave => totaisPorMes[chave]?.despesas || 0);

  const ctx = document.getElementById("graficoDesempenho").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ultimos6Meses,
      datasets: [
        {
          label: "Receitas",
          data: receitas,
          backgroundColor: "#59a14f"
        },
        {
          label: "Despesas",
          data: despesas,
          backgroundColor: "#e15759"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      }
    }
  });
}

criarGraficoDesempenho(transactions);

// Agrupa as despesas por categoria
function agruparDespesasPorCategoria(transactions) {
  const totais = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      totais[t.category] = (totais[t.category] || 0) + t.amount;
    }
  });

  return totais;
}

function criarGraficoCategorias(transactions) {
  const totaisPorCategoria = agruparDespesasPorCategoria(transactions);

  const labels = Object.keys(totaisPorCategoria);
  const valores = Object.values(totaisPorCategoria);

  const cores = {
    "Trabalho": "#ff00f2",
    "Casa": "#f28e2b",
    "Saúde": "#e15759",
    "Lazer": "#59a14f",
    "Transporte": "#76b7b2",
    "Alimentação": "#1900ff"
  };

  const ctx = document.getElementById("graficoCategorias").getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: labels.map(l => cores[l] || "#bab0ac")
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 10
      },
      plugins: {
        legend: {
          position: "right",
          align: "center",
          labels: {
            boxWidth: 14,
            padding: 16,
            usePointStyle: true,
            generateLabels: function(chart) {
              const data = chart.data;
              const total = data.datasets[0].data.reduce((soma, v) => soma + v, 0);

              return data.labels.map(function(label, i) {
                const valor = data.datasets[0].data[i];
                const percentual = ((valor / total) * 100).toFixed(1);

                return {
                  text: `${label} (${percentual}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  pointStyle: "circle",
                  index: i
                };
              });
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      }
    }
  });
}

criarGraficoCategorias(transactions);