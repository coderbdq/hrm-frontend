// src/pages/FaceLogin.jsx
import { useEffect, useRef, useState } from "react";
import * as faceLandmarks from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const FaceLogin = () => {
  const videoRef = useRef(null);
  const modelRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (!cancelled && videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const model = await faceLandmarks.load(
          faceLandmarks.SupportedPackages.mediapipeFacemesh
        );
        if (!cancelled) {
          modelRef.current = model;
          setLoading(false);
        }
      } catch (err) {
        console.error("Lỗi khởi tạo camera/model:", err);
        if (!cancelled) {
          alert("Không thể khởi tạo camera hoặc model!");
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      const stream = videoRef.current?.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureAndLogin = async () => {
    if (!modelRef.current) {
      alert("Model chưa sẵn sàng!");
      return;
    }

    const predictions = await modelRef.current.estimateFaces({
      input: videoRef.current,
    });

    if (!predictions.length) {
      alert("Không thấy khuôn mặt!");
      return;
    }

    const face = predictions[0].scaledMesh;
    const flat = face.flat();
    const vector128 = flat.slice(0, 128);

    try {
      const res = await api.post("/api/auth/face-login", {
        vector: vector128,
      });

      const { accessToken } = res.data;
      localStorage.setItem("accessToken", accessToken);

      // ✅ quay về Dashboard (route "/")
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("FaceID không khớp hoặc chưa đăng ký!");
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Đăng nhập bằng FaceID</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="320"
        height="240"
        style={{ borderRadius: 12, marginTop: 20 }}
      />

      <br />

      <button
        onClick={captureAndLogin}
        style={{
          marginTop: 20,
          padding: "10px 18px",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        XÁC THỰC FACE ID
      </button>

      {loading && <p>Đang tải model... vui lòng chờ...</p>}
    </div>
  );
};

export default FaceLogin;
