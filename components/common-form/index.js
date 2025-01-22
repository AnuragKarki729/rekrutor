import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function CommonForm({ action, buttonText, isBtnDisabled, formControls, btnType, formData, setFormData, handleFileChange }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    action();
  };

  function renderInputByComponentType(getCurrentControl) {
    switch (getCurrentControl.componentType) {
      case "input":
        return (
          <div className="relative flex items-center mt-8">
            <Input
              type={getCurrentControl.type || "text"}
              disabled={getCurrentControl.disabled}
              placeholder={getCurrentControl.placeholder}
              name={getCurrentControl.name}
              id={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.value,
                })
              }
              className="w-full rounded-md h-[60px] px-4 bg-gray-100 text-lg text-center outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:drop-shadow-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 placeholder:text-sm placeholder:text-center"
            />
          </div>
        );

      case "file":
        return (
          <div className="mt-8">
            <div className="relative">
              <Input
                id={getCurrentControl.name}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  if (event.target.files && event.target.files.length > 0) {
                    const selectedFile = event.target.files[0];
                    setFormData((prev) => ({
                      ...prev,
                      [getCurrentControl.name]: selectedFile.name,
                    }));
                    handleFileChange(event);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor={getCurrentControl.name}
                className="w-full rounded-md h-[60px] px-4 bg-gray-100 text-lg flex items-center justify-center cursor-pointer outline-none drop-shadow-sm transition-all duration-200 ease-in-out hover:bg-white hover:drop-shadow-lg"
              >
                {formData[getCurrentControl.name] ? (
                  <span className="truncate text-gray-700">
                    {formData[getCurrentControl.name]}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Upload Resume
                  </span>
                )}
              </label>
            </div>
          </div>
        );

      default:
        // Default to a text input if the componentType is not specified or recognized
        return (
          <div className="relative flex items-center mt-8">
            <Input
              type="text"
              disabled={getCurrentControl.disabled}
              placeholder={getCurrentControl.placeholder}
              name={getCurrentControl.name}
              id={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.value,
                })
              }
              className="w-full rounded-md h-[60px] px-4 bg-gray-100 text-lg outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:drop-shadow-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 placeholder:text-sm placeholder:text-center"
            />
          </div>
        );
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {formControls.map((control) => (
          <div key={control.name || control.id}>
            {renderInputByComponentType(control)}
          </div>
        ))}

        <div className="mt-6 w-full">
          <Button
            type={btnType || "submit"}
            className="w-full rounded-md h-[60px] px-4 bg-indigo-600 text-white text-lg font-semibold transition-all duration-200 ease-in-out hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isBtnDisabled}
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CommonForm;