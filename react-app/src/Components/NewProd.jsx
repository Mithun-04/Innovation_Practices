import { useState } from "react";
import { Upload } from "lucide-react";
import "./NewProd.css";


const LIST_DATA = [{ id: 1, name: "Laser Cutting" }, { id: 2, name: "Milling"}, {id: 3, name: "Bending"}, {id: 4, name: "Drilling"}];

const handleSelect = (event) => {

}


function NewProd() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="container">
      <h1>ENTER PRODUCT DETAILS</h1>
      <form>
      <label>Enter external PO number</label>
        <div className="input-box">
          
          <input type="text" />
        </div>
        <label>Enter internal PO number</label>
        <div className="input-box">
          
          <input type="text" />
        </div>
        <label>Enter product name</label>
        <div className="input-box">
          
          <input type="text" />
        </div>
        <label>Enter company name</label>
        <div className="input-box">
          <input type="text" />
        </div>
        <div className="uploading">
          <label>Upload CAD Design</label>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="fileInput"
          />
          <label htmlFor="fileInput" className="upload-button">
            <Upload />
          </label>
          {fileName && <p>Selected file: {fileName}</p>}
        </div>
        <div className="check-box">
          <label>Assign units for product</label>
          {LIST_DATA.map((item) => {
            return (
              <div key={item.id} className="checkbox-container">
                <input
                  type="checkbox"
                  id={item.id}
                  name={item.name}
                  value={item.name}
                  onChange={handleSelect}
                />
                <label htmlFor={item.id}>{item.name}</label>
                </div>
            );
          })}
        </div>
          
        <button>
            Create Product
        </button>
      </form>
    </div>
  );
}

export default NewProd;
