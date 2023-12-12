"use client";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

export default function Provience_mast() {
  let emptyProduct = {
    id: 0,
    province_id: "",
    province_name: "",
    province_status: "",
    country_id: "",
    country_name: "",
  };

  const status = [
    { name: "true", code: "true" },
    { name: "false", code: "false" },
  ];

  const [products, setProducts] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [selectedProducts, setSelectedProducts] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const dt = useRef(null);
  const [countries, setCountries] = useState([]);
  const [exist, setExist] = useState(false);

  useEffect(() => {
    fetch("http://86.48.3.100:1337/api/province-mstrs?populate=*")
      .then((res) => res.json())
      .then((data) =>
        setProducts(
          data.data.map((cv) => {
            return {
              id: cv.id,
              province_id: cv.attributes.province_id,
              province_name: cv.attributes.province_name,
              province_status: cv.attributes.province_status,
              country_id: cv.attributes.country_mstr.data.id,
              country_mstr:
                cv.attributes.country_mstr.data.attributes.country_name,
            };
          })
        )
      )
      .catch((error) => console.log(error.message));
  }, [products]);

  useEffect(() => {
    fetch(
      "http://86.48.3.100:1337/api/country-mstrs?filters[country_status][$eq]=true"
    )
      .then((res) => res.json())
      .then((data) =>
        setCountries(
          data.data.map((cv) => {
            return {
              country_id: cv.id,
              country_name: cv.attributes.country_name,
            };
          })
        )
      )
      .catch((error) => console.log(error.message));
  }, []);

  const openNew = () => {
    product.province_id = createId();
    setSubmitted(false);
    setProductDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
  };

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
  };

  //  =================================== SAVE ITEM function =====================================
  const saveProduct = async () => {
    setSubmitted(true);
    console.log(product);
    if (!exist) {
      if (product.province_name.trim() && product.province_status) {
        let _products = [...products];
        let _product = { ...product };

        if (product.id) {
          const index = findIndexById(product.id);
          _products[index] = _product;

          const responce = await fetch(
            `http://86.48.3.100:1337/api/province-mstrs/${product.id}}`,
            {
              method: "PUT",
              body: JSON.stringify({
                data: {
                  province_name: _product.province_name,
                  province_status: _product.province_status,
                  country_mstr: _product.country_id,
                },
              }),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
              },
            }
          );

          toast.current.show({
            severity: "success",
            summary: "Successful",
            detail: "Product Updated",
            life: 3000,
          });
        } else {
          try {
            _product.province_id = createId();

            const response = await fetch(
              "http://86.48.3.100:1337/api/province-mstrs",
              {
                method: "POST",
                body: JSON.stringify({
                  data: {
                    province_id: _product.province_id,
                    province_name: _product.province_name,
                    province_status: _product.province_status,
                    country_mstr: _product.country_id,
                  },
                }),
                headers: {
                  "Content-type": "application/json; charset=UTF-8",
                },
              }
            );

            const data = await response.json();
            _product.id = data.data.id;
            _products.push(_product);

            toast.current.show({
              severity: "success",
              summary: "Successful",
              detail: "Product Created",
              life: 3000,
            });
          } catch (error) {
            console.log("error", error.message);
          }
        }

        setProducts(_products);
        setProductDialog(false);
        setProduct(emptyProduct);
        setExist(false);
      }
    }
  };

  //  =================================== SAVE ITEM function =====================================

  const findIndexById = (id) => {
    let index = -1;

    for (let i = 0; i < products.length; i++) {
      //===========================================================This is database field for EDIT
      if (products[i].province_id === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  const confirmDeleteProduct = (product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  };

  // single item delete===================================================
  const deleteProduct = () => {
    try {
      fetch(`http://86.48.3.100:1337/api/province-mstrs/${product.id}`, {
        method: "DELETE",
      });
      let _products = products.filter((val) => val.id !== product.id);

      setProducts(_products);
      setDeleteProductDialog(false);
      setProduct(emptyProduct);
      toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: "Product Deleted",
        life: 3000,
      });
    } catch (error) {
      console.log("Error", error.message);
    }
  };

  // ===========CHANGE PK FIELS ACCORDING TO TABLE =========================
  const createId = () => {
    let maxProvinceId = Math.max(
      ...products.map((product) => product.province_id || 0),
      0
    );
    const provinceId = maxProvinceId == 0 ? 1001 : maxProvinceId + 1;

    return provinceId;
  };
  //========================================================================
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const confirmDeleteSelected = () => {
    setDeleteProductsDialog(true);
  };

  const deleteSelectedProducts = () => {
    try {
      for (let i in selectedProducts) {
        fetch(
          `http://86.48.3.100:1337/api/province-mstrs/${selectedProducts[i].id}}`,
          {
            method: "DELETE",
          }
        );
      }
      let _products = products.filter((val) => !selectedProducts.includes(val));
      console.log(selectedProducts, selectedProducts.length);

      setProducts(_products);
      setDeleteProductsDialog(false);
      setSelectedProducts(null);
      toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: "Countries Deleted",
        life: 3000,
      });
    } catch (error) {
      console.log("Error", error.message);
    }
  };

  const onCategoryChange = (e) => {
    let _product = { ...product };

    _product["category"] = e.value;
    setProduct(_product);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _product = { ...product };

    name == "province_name"
      ? (_product[`${name}`] = val.toUpperCase())
      : (_product[`${name}`] = val);

    if (name == "province_name") {
      console.log("province_name");
      const isDuplicate = products.some(
        (item) => item.province_name.toUpperCase() === val.toUpperCase()
      );

      if (isDuplicate) {
        setExist(true);
        setSubmitted(true);
      } else {
        setSubmitted(false);
        setExist(false);
      }
    }
    setProduct(_product);
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _product = { ...product };
    _product[`${name}`] = val;
    setProduct(_product);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap">
        <Button //This is Add new Record Button =====================================
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
        />
        <Button //This is Delete button for multi selected records
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={confirmDeleteSelected}
          disabled={!selectedProducts || !selectedProducts.length}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help"
        onClick={exportCSV}
      />
    );
  };

  const editProduct = (product) => {
    try {
      setProduct({ ...product });
      setProductDialog(true);
    } catch (error) {
      console.log("Error", error.message);
    }
  };

  // data grid Edit and Delete BUtton =======================================================>
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          // outlined
          // className="mr-2"
          onClick={() => editProduct(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          // outlined
          severity="danger"
          onClick={() => confirmDeleteProduct(rowData)}
        />
      </React.Fragment>
    );
  };

  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Provinces</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          style={{ width: 300 }}
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
      </span>
    </div>
  );

  const productDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveProduct} />
    </React.Fragment>
  );

  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteProductDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteProduct}
      />
    </React.Fragment>
  );

  const deleteProductsDialogFooter = //multiple delete at once
    (
      <React.Fragment>
        <Button
          label="No"
          icon="pi pi-times"
          outlined
          onClick={hideDeleteProductsDialog}
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={deleteSelectedProducts}
        />
      </React.Fragment>
    );
  // ======================Main function Body=========================================================================================================
  return (
    <div>
      <Toast ref={toast} />
      <div className="card">
        <Toolbar
          className="mb-4"
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
        ></Toolbar>

        <DataTable
          ref={dt}
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          responsiveLayout="scroll"
          value={products}
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          dataKey="province_id"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
          globalFilter={globalFilter}
          header={header}
        >
          <Column
            field="id"
            header="Id"
            sortable
            style={{ minWidth: "1rem" }}
          ></Column>
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
            exportable={false}
          ></Column>
          <Column
            field="province_id"
            header="Province Id"
            sortable
            style={{ minWidth: "8rem" }}
          ></Column>

          <Column
            field="province_name"
            header="Province Name"
            sortable
            style={{ minWidth: "10rem" }}
          ></Column>
          <Column
            field="country_mstr"
            header="Country Name"
            sortable
            style={{ minWidth: "12rem" }}
          ></Column>

          <Column
            field="province_status"
            header="Status"
            sortable
            style={{ minWidth: "10rem" }}
          ></Column>
          <Column
            header="Actions"
            body={actionBodyTemplate}
            exportable={false}
            style={{ width: "5rem", margin: 5 }}
          ></Column>
        </DataTable>
      </div>
      <Dialog
        //Add new Reord dialog box ============================================================================
        visible={productDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Province Details"
        modal
        className="p-fluid"
        footer={productDialogFooter} // cancel and save button
        onHide={hideDialog}
      >
        {/* input fields start from herer ==========Province ID================================================= */}
        <div className="field">
          <label htmlFor="province_id" className="font-bold">
            Province ID
          </label>
          <InputText
            name="province_id"
            id="province_id"
            value={product.province_id}
            onChange={(e) => onInputChange(e, "province_id")}
            disabled
            // className={classNames({"p-invalid": submitted && !product.province_id, })}
          />
        </div>
        {/* end of input fields start from herer ============PROVINCE ID=============================================*/}

        {/* input fields start from herer ===================PROVINCE NAME============================================*/}
        <div className="field">
          <label htmlFor="province_name" className="font-bold">
            Province Name
          </label>
          <InputText
            name="province_name"
            id="province_name"
            value={product.province_name}
            onChange={(e) => onInputChange(e, "province_name")}
            autoFocus
            required
            className={classNames({
              "p-invalid": submitted && !product.province_name,
            })}
          />
          {submitted && !product.province_name && (
            <small className="p-error">Province Name is required.</small>
          )}
          {submitted && exist && product.province_name && (
            <small className="p-error">Province Name already Exist.</small>
          )}
        </div>
        {/* end of input fields start from herer ===================PROVINCE NAME======================================*/}

        {/* input fields start from herer ===================COUNTRY NAME============================================*/}
        <div className="field">
          <label htmlFor="country_mstr" className="font-bold">
            Country Name
          </label>
          <Dropdown
            value={product.country_id}
            options={countries}
            onChange={(e) => onInputChange(e, "country_id")}
            optionValue="country_id"
            optionLabel="country_name"
            placeholder="Select COUNTRY....."
            className={classNames({
              "p-invalid": submitted && !product.country_id,
            })}
          />
          {submitted && !product.country_id && (
            <small className="p-error">Country Name is required.</small>
          )}
        </div>
        {/* end of input fields start from herer ===================COUNTRY NAME======================================*/}

        {/* input fields start from herer =========================PROVINCE STATUS======================================*/}
        <div className="field">
          <Dropdown
            value={String(product.province_status)}
            options={status}
            onChange={(e) => onInputChange(e, "province_status")}
            optionValue="code"
            optionLabel="name"
            placeholder="Select Status....."
          />
          {submitted && !product.province_status && (
            <small className="p-error">Status is required.</small>
          )}
        </div>

        {/* end of input fields start from herer ========================PROVINCE STATUS=================================*/}
      </Dialog>
      {/* ===End of Add new Dialog box===================================================================================== */}{" "}
      <Dialog
        visible={deleteProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteProductDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {/* change the product province name accordingly */}
          {product && (
            <span>
              Are you sure you want to delete <b>{product.province_name}</b>?
            </span>
          )}
        </div>
      </Dialog>
      <Dialog
        visible={deleteProductsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductsDialogFooter}
        onHide={hideDeleteProductsDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>Are you sure you want to delete the selected Provinces?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
