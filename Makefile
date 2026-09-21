UUID = rectangle-min@akpower
ZIP_FILE = $(UUID).shell-extension.zip
SCHEMA_DIR = schemas

.PHONY: all schemas install uninstall zip clean

all: schemas

schemas:
	@echo "Compiling GSettings schemas..."
	@glib-compile-schemas $(SCHEMA_DIR)

install:
	@./install.sh

uninstall:
	@./install.sh --uninstall

zip: schemas
	@echo "Packaging $(ZIP_FILE)..."
	@rm -f $(ZIP_FILE)
	@zip -q -r $(ZIP_FILE) \
		metadata.json \
		extension.js \
		stylesheet.css \
		icons/ \
		schemas/
	@echo "Created $(ZIP_FILE)"

clean:
	@rm -f $(ZIP_FILE)
	@rm -f $(SCHEMA_DIR)/gschemas.compiled
	@echo "Cleaned build artifacts."
