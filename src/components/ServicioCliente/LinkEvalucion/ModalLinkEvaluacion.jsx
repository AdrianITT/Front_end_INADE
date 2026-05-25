import {
  Modal,
  Radio,
  Space,
  Alert,
  DatePicker,
} from "antd";

const { RangePicker } = DatePicker;


export const ModalLinkEvaluacion = ({ 
    pdfModalOpen, 
    handleGeneratePdf, 
    setPdfModalOpen,
    pdfLoading,
    pdfType,
    setPdfType,
    selectedRowKeys,
    pdfDateRange,
    setPdfDateRange
 }) => {
    return (
        <>
        <Modal
        title="Exportar Evaluaciones PDF"
        open={pdfModalOpen}
        onCancel={() => setPdfModalOpen(false)}
        onOk={handleGeneratePdf}
        confirmLoading={pdfLoading}
        okText="Generar PDF"
        >

        <Space
            direction="vertical"
            style={{ width: "100%" }}
        >

            <Radio.Group
            value={pdfType}
            onChange={(e) =>
                setPdfType(e.target.value)
            }
            >

            <Space direction="vertical">

                <Radio value="tokens">
                Exportar seleccionados
                </Radio>

                <Radio value="dates">
                Exportar por rango de fechas
                </Radio>

            </Space>

            </Radio.Group>

            {/* ========================= */}
            {/* TOKENS */}
            {/* ========================= */}

            {pdfType === "tokens" && (

            <Alert
                type="info"
                showIcon
                message={`Seleccionados: ${selectedRowKeys.length}`}
            />

            )}

            {/* ========================= */}
            {/* FECHAS */}
            {/* ========================= */}

            {pdfType === "dates" && (

            <RangePicker
                style={{ width: "100%" }}
                value={pdfDateRange}
                onChange={setPdfDateRange}
            />

            )}

        </Space>

        </Modal>
        </>
    );
}