import { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";

const SplitBill = () => {

    const { getTotalCartAmount } = useContext(StoreContext);
    const [people, setPeople] = useState(2);
    const total = getTotalCartAmount();
    const amountPerPerson =
        people > 0 ? total / people : 0;

    return (
        <div>
            <h1>Split the Bill</h1>
            <p>Total: ETB {total}</p>
            <label>
                Number of People
            </label>

            <input
                type="number"
                min="2"
                value={people}
                onChange={(e) =>
                    setPeople(Number(e.target.value))
                }
            />
            <h2>
                Each person pays
            </h2>

            <h1>
                ETB {amountPerPerson.toFixed(2)}
            </h1>

        </div>
    );
};

export default SplitBill;