const canvas = document.getElementById('floorCanvas');
const ctx = canvas.getContext('2d');
let rooms = [];
const roomWidth = 120;
const roomHeight = 80;
const margin = 20;
let selectedRoom = null;

function initializeRooms() {
  const hospitalId = document.getElementById('hospitalId').value.trim();
  const floorCount = parseInt(document.getElementById('floorCount').value);
  const roomPerFloor = parseInt(document.getElementById('roomPerFloor').value);
  const capacity = parseInt(document.getElementById('capacity').value);

  if (!hospitalId || isNaN(floorCount) || isNaN(roomPerFloor) || isNaN(capacity)) {
    alert('모든 정보를 정확히 입력해주세요.');
    return;
  }

  fetch('/api/rooms/init', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      /*'x-admin-token': 'secret-admin-token'*/
    },
    body: JSON.stringify({ hospitalId, floorCount, roomPerFloor, capacity })
  })
    .then(res => res.json())
    .then(data => {
      console.log('등록 결과:', data);
      if (data.error) {
        alert(`에러: ${data.error}`);
      } else {
        alert(`${data.count ?? '?'}개 병실 등록 완료`);
        fetchRooms();
      }
    });
}

function fetchRooms() {
  const hospitalId = document.getElementById('hospitalId').value.trim();
  const roomPerFloor = parseInt(document.getElementById('roomPerFloor').value);

  if (!hospitalId || isNaN(roomPerFloor)) {
    alert('병원 ID와 층당 방 수를 정확히 입력해주세요.');
    return;
  }

  fetch(`/api/rooms/${hospitalId}`)
    .then(res => res.json())
    .then(data => {
      rooms = data.map((r) => {
        const roomNum = parseInt(r.roomNumber);
        const floor = r.floor;
        const x = ((roomNum % 100) - 1) * (roomWidth + margin) + margin;
        const y = (floor - 1) * (roomHeight + margin) + margin;

        return {
          x,
          y,
          number: r.roomNumber,
          patients: r.patients,
          capacity: r.capacity,
          hospitalId: r.hospitalId
        };
      });
      drawRooms();
    });
}

function drawRooms() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rooms.forEach(room => {
    if (room.patients.length === 0) {
      ctx.fillStyle = '#66bb6a';
    } else if (room.patients.length < room.capacity) {
      ctx.fillStyle = '#fdd835';
    } else {
      ctx.fillStyle = '#e53935';
    }

    ctx.fillRect(room.x, room.y, roomWidth, roomHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(room.x, room.y, roomWidth, roomHeight);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`병실 ${room.number}`, room.x + 10, room.y + 20);
    ctx.fillText(`${room.patients.length}/${room.capacity}명`, room.x + 10, room.y + 40);
  });
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (const room of rooms) {
    if (x > room.x && x < room.x + roomWidth && y > room.y && y < room.y + roomHeight) {
      openDialog(room);
      break;
    }
  }
});

function openDialog(room) {
  selectedRoom = room;
  const dialog = document.getElementById('roomDialog');
  document.getElementById('roomTitle').innerText = `병실 ${room.number}`;
  document.getElementById('roomCapacity').innerText = `${room.patients.length}/${room.capacity}명`;

  const ul = document.getElementById('patientList');
  ul.innerHTML = '';
  room.patients.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    ul.appendChild(li);
  });

  document.getElementById('newPatientName').value = '';
  dialog.showModal();
}

function closeDialog() {
  document.getElementById('roomDialog').close();
  selectedRoom = null;
}

function assignPatientToRoom() {
  const name = document.getElementById('newPatientName').value.trim();
  if (!name) return alert('이름을 입력하세요.');

  fetch('/api/rooms/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hospitalId: selectedRoom.hospitalId,
      roomNumber: selectedRoom.number,
      patientName: name
    })
  }).then(() => {
    closeDialog();
    fetchRooms();
  });
}

function dischargePatientFromRoom() {
  const name = document.getElementById('newPatientName').value.trim();
  if (!name) return alert('퇴원시킬 환자 이름을 입력하세요.');

  fetch('/api/rooms/discharge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hospitalId: selectedRoom.hospitalId,
      roomNumber: selectedRoom.number,
      patientName: name
    })
  }).then(() => {
    closeDialog();
    fetchRooms();
  });
}

function searchPatient() {
  const name = document.getElementById('searchName').value.trim();
  const hospitalId = document.getElementById('hospitalId').value.trim();
  const resultDiv = document.getElementById('searchResult');

  if (!name || !hospitalId) return alert("환자 이름과 병원 ID를 입력하세요.");

  fetch(`/api/rooms/patient/search?hospitalId=${hospitalId}&name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.found) {
        resultDiv.innerHTML = `✅ <strong>${name}</strong> 님은 병실 <strong>${data.roomNumber}</strong>에 입원 중입니다.`;
      } else {
        resultDiv.innerHTML = `❌ <strong>${name}</strong> 님은 입원 중이 아닙니다.`;
      }
    });
}

document.getElementById('goManagerBtn').addEventListener('click', () => {
  window.location.href = '/manager';
})
document.getElementById('goPatientBtn').addEventListener('click', () => {
  window.location.href = '/patient/patientList.html';
});