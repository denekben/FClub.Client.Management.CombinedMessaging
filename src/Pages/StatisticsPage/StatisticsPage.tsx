import React, { useState, useEffect } from 'react';
import { getStatisticNotesAPI as getMembershipStats } from '../../Services/Management/StatisticNotesService';
import { getStatisticNotesAPI as getEntriesStats } from '../../Services/AccessControl/StatisticNotesService';
import { StatisticNoteDto as MembershipNote } from '../../Models/Management/StatisticNotes/StatisticNoteDto';
import { StatisticNoteDto as EntryNote } from '../../Models/AccessControl/StatisticNotes/StatisticNoteDto';
import { getBranchesAPI} from '../../Services/Management/BranchesService';
import { getBranchesFullnessAPI, getBranchFullnessAPI } from '../../Services/AccessControl/FullnessService';
import { GetStatisticNotes } from '../../Services/Management/StatisticNotesService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Layout } from '../../Components/Layout';
import { BranchDto } from '../../Models/AccessControl/Branches/BranchDto';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const StatisticsPage = () => {
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [membershipStats, setMembershipStats] = useState<MembershipNote[]>([]);
  const [entriesStats, setEntriesStats] = useState<EntryNote[]>([]);
  const [branchesFullness, setBranchesFullness] = useState<BranchDto[]>([]);
  const [selectedBranchFullness, setSelectedBranchFullness] = useState<BranchDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBranchesAPI({}).then(res => {
      setBranches(res.data.map(b => ({ id: b.id, name: b.name || 'Без названия' })));
    });

    loadBranchesFullness();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params: GetStatisticNotes = {
          branchId: branchId || undefined,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        };
        const [membRes, entrRes] = await Promise.all([
          getMembershipStats(params),
          getEntriesStats(params),
        ]);
        setMembershipStats(membRes.data);
        setEntriesStats(entrRes.data);

        if (branchId) {
          console.log(branchId)
          const branchRes = await getBranchFullnessAPI(branchId);
          setSelectedBranchFullness(branchRes.data);
        }
      } catch (e) {
        setMembershipStats([]);
        setEntriesStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [branchId, startDate, endDate]);

  const loadBranchesFullness = async () => {
    try {
      const response = await getBranchesFullnessAPI({});
      setBranchesFullness(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных о заполненности филиалов:', error);
    }
  };

  const labels = membershipStats.map(n => new Date(n.createdDate).toLocaleDateString('ru-RU'));
  const membershipQuantity = membershipStats.map(n => n.membershipQuantity);
  const membershipCost = membershipStats.map(n => n.membershipCost);
  const entriesQuantity = entriesStats.map(n => n.entriesQuantity);

  const branchesFullnessData = {
    labels: branchesFullness.map(branch => branch.name || 'Без названия'),
    datasets: [{
      data: branchesFullness.map(branch => 
        Math.round((branch.currentClientQuantity / branch.maxOccupancy) * 100)
      ),
      backgroundColor: branchesFullness.map((_, index) => 
        `hsl(${(index * 360) / branchesFullness.length}, 70%, 50%)`
      ),
      borderWidth: 1,
    }]
  };

  const branchFullnessData = selectedBranchFullness ? {
    labels: ['Занято', 'Свободно'],
    datasets: [{
      data: [
        selectedBranchFullness.currentClientQuantity,
        selectedBranchFullness.maxOccupancy - selectedBranchFullness.currentClientQuantity
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)'
      ],
      borderWidth: 1,
    }]
  } : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Статистика</h1>
          <form className="flex flex-wrap gap-4 mb-8 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Филиал</label>
              <select
                value={branchId || ''}
                onChange={e => setBranchId(e.target.value || null)}
                className="border px-3 py-2 rounded"
              >
                <option value="">Все филиалы</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата с</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата по</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border px-3 py-2 rounded"
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Покупки абонементов</h2>
                <Bar
                  data={{
                    labels,
                    datasets: [
                      {
                        label: 'Кол-во абонементов',
                        data: membershipQuantity,
                        backgroundColor: 'rgba(37, 99, 235, 0.6)',
                      },
                      {
                        label: 'Сумма (₽)',
                        data: membershipCost,
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: false },
                    },
                  }}
                />
              </div>
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Проходки</h2>
                <Line
                  data={{
                    labels: entriesStats.map(n => 
                      new Date(n.createdDate).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ),
                    datasets: [
                      {
                        label: 'Кол-во проходок',
                        data: entriesQuantity,
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: false },
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
            {!(branchId && selectedBranchFullness!=null) && (
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Заполненность филиалов (%)</h2>

                  <Doughnut 
                    data={branchesFullnessData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const branch = branchesFullness[context.dataIndex];
                              return `${branch.name || 'Без названия'}: ${context.raw}% (${branch.currentClientQuantity}/${branch.maxOccupancy})`;
                            }
                          }
                        }
                      }
                    }}
                  />
              </div>
                )}


              {(branchId && selectedBranchFullness!=null) && (
  <div className="bg-white rounded shadow p-4">
    <h2 className="text-lg font-semibold mb-4">
      Заполненность: {selectedBranchFullness.name || 'Без названия'}
    </h2>
    <div className="flex flex-col md:flex-row items-center">
      <div className="w-full md:w-1/2">
        <Doughnut 
          data={{
            labels: ['Занято', 'Свободно'],
            datasets: [{
              data: [
                selectedBranchFullness.currentClientQuantity,
                selectedBranchFullness.maxOccupancy - selectedBranchFullness.currentClientQuantity
              ],
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)'
              ],
              borderWidth: 1,
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
            }
          }}
        />
      </div>
      <div className="w-full md:w-1/2 pl-4 mt-4 md:mt-0">
        <p className="mb-2">
          <span className="font-semibold">Название:</span> {selectedBranchFullness.name}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Макс. вместимость:</span> {selectedBranchFullness.maxOccupancy}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Текущее кол-во клиентов:</span> {selectedBranchFullness.currentClientQuantity}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Заполненность:</span> {Math.round(
            (selectedBranchFullness.currentClientQuantity / selectedBranchFullness.maxOccupancy) * 100
          )}%
        </p>
      </div>
    </div>
  </div>
)}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default StatisticsPage;