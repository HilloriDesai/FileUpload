import toast from "react-hot-toast";

export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 4000,
    position: "bottom-right",
    style: {
      background: "#10B981",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 4000,
    position: "bottom-right",
    style: {
      background: "#EF4444",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
    },
  });
};
