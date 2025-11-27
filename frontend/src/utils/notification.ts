import Swal from "sweetalert2";

interface ShowSwalProps {
  isSuccess: boolean;
  title: string;
}

export const showSwal = ({ isSuccess, title }: ShowSwalProps) => {
  Swal.fire({
    width: "24rem",
    icon: isSuccess ? "success" : "error",
    title: title,
    showConfirmButton: false,
    // showCloseButton: true,
    timer: 1500,
  });
};
