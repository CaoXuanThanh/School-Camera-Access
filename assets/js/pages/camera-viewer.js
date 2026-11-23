"use strict";

async function renderViewer(main, cameraId) {
  const h = app.html;
  main.classList.add("viewer-page");
  const back = '<a class="back-route" href="#/phu-huynh">Về camera trường học</a>';
  function renderError(message) {
    main.innerHTML = `${back}<section class="panel empty-panel" role="status"><h1>${h(message)}</h1>
      <p class="muted">Bạn có thể mở camera khác trong danh sách được nhà trường cấp quyền.</p></section>`;
  }
  if (!cameraId) return renderError("Thiếu mã camera");

  main.innerHTML = `${back}<p class="muted" role="status">Đang kiểm tra quyền xem…</p>`;
  let view;
  try { view = await service.getCameraView(cameraId); }
  catch (error) { return renderError(error.message); }
  if (!main.isConnected) return;

  const { camera } = view;
  document.title = `${camera.name} | Camera Access`;
  main.innerHTML = `
    ${back}
    <div class="screen-heading viewer-heading">
      <div>
        <h1>${h(camera.name)}</h1>
        <p>${h(camera.location)}</p>
        <p id="viewer-access-evidence" class="small muted" role="status"></p>
      </div>
      <div class="viewer-statuses">
        <span id="viewer-state" class="badge badge-status"></span>
        <span class="badge badge-playback" id="viewer-playback" role="status" aria-atomic="true"></span>
      </div>
    </div>
    <figure class="panel viewer-frame">
      <div class="viewer-stage">
        <video id="camera-player" controls muted playsinline loop preload="metadata" aria-label="Video mẫu cho ${h(camera.name)}" hidden></video>
        <video id="device-player" controls muted playsinline aria-label="Webcam máy này" hidden></video>
        <span class="viewer-media-label" id="media-label">Video mẫu</span>
        <p class="viewer-stage-message" id="viewer-stage-message" aria-hidden="true" hidden></p>
      </div>
      <figcaption>
        <p class="small muted" id="media-description">Clip quay mẫu được lưu trên máy.</p>
        <div class="viewer-actions">
          <button class="button button-secondary" id="retry-video" type="button" hidden>Thử tải lại</button>
          <button class="button button-secondary" id="use-device-camera" type="button" hidden>Dùng webcam máy này</button>
        </div>
        <p id="viewer-feedback" class="small muted viewer-feedback" role="status" hidden></p>
      </figcaption>
    </figure>`;

  const demoPlayer = main.querySelector("#camera-player");
  const devicePlayer = main.querySelector("#device-player");
  const stageMessage = main.querySelector("#viewer-stage-message");
  const deviceState = main.querySelector("#viewer-state");
  const playState = main.querySelector("#viewer-playback");
  const accessEvidence = main.querySelector("#viewer-access-evidence");
  const label = main.querySelector("#media-label");
  const caption = main.querySelector(".viewer-frame figcaption");
  const sourceDescription = main.querySelector("#media-description");
  const retry = main.querySelector("#retry-video");
  const useDevice = main.querySelector("#use-device-camera");
  const feedback = main.querySelector("#viewer-feedback");
  let currentPlayer = null;
  let active = true;

  function releaseDemo() {
    if (!demoPlayer.hasAttribute("src")) return;
    demoPlayer.pause();
    demoPlayer.removeAttribute("src");
    demoPlayer.load();
  }

  function releaseDevice() {
    devicePlayer.srcObject?.getTracks().forEach((track) => track.stop());
    devicePlayer.srcObject = null;
  }

  function report(message) {
    feedback.textContent = message;
    feedback.hidden = !message;
  }

  function setPlayback(status, message, overlay = "") {
    playState.dataset.state = status;
    if (playState.textContent !== message) playState.textContent = message;
    stageMessage.textContent = overlay;
    stageMessage.hidden = !overlay;
    retry.hidden = status !== "error" || currentPlayer !== demoPlayer;
  }

  function tryPlay(player) {
    player.play().catch((error) => {
      if (active && currentPlayer === player && error.name === "NotAllowedError") {
        setPlayback("ready", "Sẵn sàng · Bấm phát");
      }
    });
  }

  for (const player of [demoPlayer, devicePlayer]) {
    function on(event, handler) {
      player.addEventListener(event, () => {
        if (active && currentPlayer === player && !player.hidden) handler();
      });
    }
    on("canplay", () => {
      if (player.paused && playState.dataset.state === "loading") setPlayback("ready", "Sẵn sàng · Bấm phát");
    });
    on("playing", () => setPlayback("playing", "Đang phát"));
    on("waiting", () => {
      if (!player.paused && playState.dataset.state !== "loading") setPlayback("buffering", "Đang tải thêm dữ liệu");
    });
    on("pause", () => setPlayback("paused", "Đã tạm dừng"));
    on("error", () => {
      if (player === devicePlayer) {
        releaseDevice();
        report("Webcam gặp lỗi. Đã quay về video mẫu.");
        applyView();
        return;
      }
      player.hidden = true;
      setPlayback("error", "Không tải được video", "Không tải được video mẫu. Hãy thử tải lại.");
    });
  }

  function applyView() {
    const { canPlay, demoSource, message, camera: currentCamera } = view;
    const names = currentCamera.studentsWithAccess.map((student) => student.name).join(", ");
    const evidence = `Quyền xem từ lớp ${currentCamera.className} của ${names}.`;
    if (accessEvidence.textContent !== evidence) accessEvidence.textContent = evidence;
    const online = currentCamera.enabled && currentCamera.connectionStatus === "online";
    deviceState.className = `badge badge-status badge-${online ? "online" : "offline"}`;
    deviceState.textContent = `Thiết bị · ${!currentCamera.enabled ? "Đã tắt" : online ? "Hoạt động" : "Ngoại tuyến"}`;

    if (!canPlay) {
      currentPlayer = null;
      releaseDemo();
      releaseDevice();
    }
    const usingDevice = Boolean(devicePlayer.srcObject);
    const usingDemo = Boolean(canPlay && demoSource && !usingDevice);
    const nextPlayer = usingDevice ? devicePlayer : usingDemo ? demoPlayer : null;
    const changed = nextPlayer !== currentPlayer;
    currentPlayer = nextPlayer;
    devicePlayer.hidden = !usingDevice;
    demoPlayer.hidden = !usingDemo || (!changed && playState.dataset.state === "error");
    useDevice.hidden = !canPlay || typeof navigator.mediaDevices?.getUserMedia !== "function";
    useDevice.textContent = usingDevice ? "Quay về video mẫu" : "Dùng webcam máy này";
    caption.hidden = !canPlay;
    label.hidden = !usingDevice && !usingDemo;
    sourceDescription.hidden = label.hidden;
    label.textContent = usingDevice ? "Webcam máy này" : "Video mẫu";
    sourceDescription.textContent = usingDevice ? "Hình ảnh trực tiếp trên thiết bị này." : "Clip quay mẫu được lưu trên máy.";

    if (usingDevice) {
      releaseDemo();
      if (changed) {
        setPlayback("loading", "Đang mở webcam", "Đang mở webcam…");
        tryPlay(devicePlayer);
      }
    } else if (usingDemo) {
      if (changed || demoPlayer.getAttribute("src") !== demoSource) {
        demoPlayer.hidden = false;
        setPlayback("loading", "Đang tải video", "Đang tải video mẫu…");
        demoPlayer.src = demoSource;
        tryPlay(demoPlayer);
      }
    } else {
      setPlayback("unavailable", "Chưa thể phát", message || "Camera chưa có nguồn phát.");
    }
  }

  retry.addEventListener("click", () => {
    currentPlayer = null;
    releaseDemo();
    report("");
    applyView();
  });
  useDevice.addEventListener("click", async () => {
    if (devicePlayer.srcObject) {
      releaseDevice();
      report("");
      applyView();
      return;
    }
    useDevice.disabled = true;
    report("Đang chờ trình duyệt cấp quyền webcam…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (!active || !view.canPlay) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const [track] = stream.getVideoTracks();
      track.addEventListener("ended", () => {
        if (!active || devicePlayer.srcObject !== stream) return;
        releaseDevice();
        report("Webcam đã ngắt kết nối.");
        applyView();
      });
      devicePlayer.srcObject = stream;
      report("");
      applyView();
    } catch (error) {
      if (active) report(error.name === "NotAllowedError" ? "Trình duyệt chưa cấp quyền camera." : "Không mở được webcam trên máy này.");
    } finally {
      useDevice.disabled = false;
    }
  });

  const stopWatching = service.watchCameraView(cameraId, (next, error) => {
    if (!active || !main.isConnected) return;
    if (error) {
      app.stopViewer?.();
      app.stopViewer = null;
      renderError(error.code === "FORBIDDEN" ? "Quyền xem đã bị thu hồi" : error.message);
      return;
    }
    view = next;
    applyView();
  });
  app.stopViewer = () => {
    active = false;
    currentPlayer = null;
    stopWatching();
    releaseDemo();
    releaseDevice();
  };

  applyView();
}
