npm install

TESTS = src/test/*.js

test:
	@NODE_ENV=test .src/node_modules/.bin/mocha \
			--require should \
			--reporter list \
			--slow 20 \
			--growl \
			$(TESTS)
			
.PHONY: test