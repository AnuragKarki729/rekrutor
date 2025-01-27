import { Button } from "../ui/button";
import { Box, TextField, MenuItem } from '@mui/material';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  // Generate years from 1950 to current year
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
};

function CommonForm({ action, buttonText, isBtnDisabled, formControls, btnType, formData, setFormData, handleFileChange }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    action();
  };

  function renderInputByComponentType(getCurrentControl) {
    switch (getCurrentControl.componentType) {
      case "input":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
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
            />
          </Box>
        );

      case "select":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        
        return (
          <Box className="mt-6 mb-6">
            <TextField
              select
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
              name={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""}
              disabled={getCurrentControl.disabled}
              onChange={(event) => {
                const newValue = event.target.value;
                setFormData({
                  ...formData,
                  [event.target.name]: newValue,
                  ...(event.target.name === 'experience' && newValue === 'Fresh Graduate' 
                    ? { yearsOfExperience: '', industry: '', previousCompanies: [] } 
                    : {})
                });
              }}
            >
              {getCurrentControl.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

        case 'selectJob':
          if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
            return null;
          }
        return (
          <Box className="mt-6 mb-6 flex justify-center">
            <Select
              key={getCurrentControl.name}
              onValueChange={(value) => setFormData({ ...formData, [getCurrentControl.name]: value })}
              value={formData[getCurrentControl.name] || ''}
            >
              <SelectTrigger className="w-[400px] h-[56px] px-4 text-base bg-white items-center justify-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <SelectValue placeholder={getCurrentControl.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {getCurrentControl.options.map((option) => (
                  <SelectItem 
                    key={option} 
                    value={option}
                    className="text-base"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Box>
        );

      case "number":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              type="number"
              label={getCurrentControl.label}
              variant="outlined"
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
            />
          </Box>
        );

      case "totalExperience":
        const calculateTotalExperience = () => {
          if (!formData.previousCompanies?.length) return "0 years";
          
          const totalYears = formData.previousCompanies.reduce((total, company) => {
            if (!company.startDate || !company.endDate) return total;
            
            const start = new Date(company.startDate);
            const end = new Date(company.endDate);
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
            
            return total + Math.max(0, years);
          }, 0);
          
          return `${totalYears.toFixed(1)} years`;
        };

        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              label="Total Experience"
              variant="outlined"
              disabled={true}
              name={getCurrentControl.name}
              id={getCurrentControl.name}
              value={calculateTotalExperience()}
            />
          </Box>
        );

      case "year":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              select
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
              name={getCurrentControl.name}
              value={formData[getCurrentControl.name] || ""}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.value,
                })
              }
            >
              {generateYearOptions().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

      case "file":
        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id={getCurrentControl.name}
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
                  />
                ),
                readOnly: true,
              }}
              value={formData[getCurrentControl.name] || ""}
              onClick={() => document.getElementById(getCurrentControl.name).click()}
            />
          </Box>
        );

      case "previousCompanies":
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            {(formData.previousCompanies || []).map((company, index) => (
              <Box key={index} className="flex items-center gap-4 mb-4">
                <TextField
                  label="Company Name"
                  variant="outlined"
                  value={company.name || ""}
                  onChange={(event) => {
                    const newCompanies = [...(formData.previousCompanies || [])];
                    newCompanies[index] = { ...newCompanies[index], name: event.target.value };
                    setFormData({
                      ...formData,
                      previousCompanies: newCompanies,
                    });
                  }}
                  sx={{ flex: 2 }}
                />
                
                <TextField
                  label="Position"
                  variant="outlined"
                  value={company.position || ""}
                  onChange={(event) => {
                    const newCompanies = [...(formData.previousCompanies || [])];
                    newCompanies[index] = { ...newCompanies[index], position: event.target.value };
                    setFormData({
                      ...formData,
                      previousCompanies: newCompanies,
                    });
                  }}
                  sx={{ flex: 2 }}
                />
                
                <div className="flex items-center gap-2" style={{ flex: 2 }}>
                  <TextField
                    type="date"
                    label="Start Date"
                    variant="outlined"
                    value={company.startDate || ""}
                    onChange={(event) => {
                      const newCompanies = [...(formData.previousCompanies || [])];
                      newCompanies[index] = { 
                        ...newCompanies[index], 
                        startDate: event.target.value
                      };
                      setFormData({
                        ...formData,
                        previousCompanies: newCompanies,
                      });
                    }}
                    sx={{ width: '45%' }}
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    variant="outlined"
                    value={company.endDate || ""}
                    onChange={(event) => {
                      const newCompanies = [...(formData.previousCompanies || [])];
                      newCompanies[index] = { 
                        ...newCompanies[index], 
                        endDate: event.target.value
                      };
                      setFormData({
                        ...formData,
                        previousCompanies: newCompanies,
                      });
                    }}
                    sx={{ width: '45%' }}
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    const newCompanies = formData.previousCompanies.filter((_, i) => i !== index);
                    setFormData({
                      ...formData,
                      previousCompanies: newCompanies,
                    });
                  }}
                  className="text-red-500 hover:text-red-700"
                  sx={{ minWidth: '40px', padding: '8px' }}
                >
                  ×
                </Button>
              </Box>
            ))}
            
            <Button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  previousCompanies: [
                    ...(formData.previousCompanies || []),
                    { name: "", position: "", startDate: "", endDate: "" }
                  ],
                });
              }}
              className="mt-2 text-green-600 hover:text-green-800"
              sx={{ minWidth: '40px', padding: '8px' }}
            >
              + Work Experience
            </Button>
          </Box>
        );

      default:
        if (getCurrentControl.showWhen && !getCurrentControl.showWhen(formData)) {
          return null;
        }
        return (
          <Box className="mt-6 mb-6">
            <TextField
              fullWidth
              label={getCurrentControl.label}
              variant="outlined"
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
              
            />
          </Box>
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