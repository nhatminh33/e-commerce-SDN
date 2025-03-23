import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';


const PaymentStatusHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const returnUrl = async () => {
        try {
            const res = await api.get('/vnpay_return');
            console.log(res);
            if (res && res.data.code === 200) {
                const queryParams = new URLSearchParams(location.search);
                const responseCode = queryParams.get("vnp_ResponseCode");

                if (responseCode) {
                    if (responseCode === "00") {

                        toast.success("Thanh toán thành công!");
                        navigate("/payment-success");
                    } else {
                        toast.error("Thanh toán thất bại!");
                        navigate("/payment-failed");
                    }
                }
            } else {
                navigate("/payment-failed");
            }
        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        returnUrl()
    }, [location.search, navigate]);

    return (
        <></>
    ); // This component does not render anything but handles the redirection logic
};

const PaymentSuccess = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 text-center p-6">
        <CheckCircleIcon className="text-green-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-green-700">Thanh toán thành công!</h1>
        <p className="text-gray-600 mt-2">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn sẽ sớm được xử lý.</p>
        <Link to="/" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Quay về trang chủ
        </Link>
    </div>
);

const PaymentFailed = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-center p-6">
        <XCircleIcon className="text-red-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-red-700">Thanh toán thất bại!</h1>
        <p className="text-gray-600 mt-2">Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.</p>
        <Link to="/card" className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Thử lại
        </Link>
    </div>
);

export { PaymentSuccess, PaymentFailed, PaymentStatusHandler };
