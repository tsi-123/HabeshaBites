import PropTypes from "prop-types";
import "./PaymentProgress.css";

const PaymentProgress = ({ paid, total }) => {

    const percentage = (paid / total) * 100;

    return (

        <div className="payment-progress">

            <h2>Group Payment Progress</h2>

            <div className="progress-bar">

                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                ></div>

            </div>

            <p>

                {paid} / {total} Paid

            </p>

        </div>

    );

};

PaymentProgress.propTypes = {
  paid: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default PaymentProgress;