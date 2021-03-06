sharedExamplesFor('Default suite tracking', function(getVar) {
  describe('when using variable inside another variable definition', function() {
    var user = { firstName: 'John', lastName: 'Doe' };
    var index = 0;
    var currentIndex;

    before(function() {
      expect(getVar('currentIndex')).to.equal(currentIndex);
    });

    beforeEach(function usesVariableDefinedInCurrentlyRunningSuiteInBeforeEachCallback() {
      expect(cast(getVar('currentIndex'))).to.equal(cast(currentIndex));
    });

    afterEach(function usesVariableDefinedInCurrentlyRunningSuiteInAfterEachCallback() {
      expect(cast(getVar('currentIndex'))).to.equal(cast(currentIndex));
    });

    after(function usesOwnDefinedVariable() {
      expect(getVar('currentIndex')).to.equal(currentIndex);
    });

    def('personName', function() {
      return getVar('firstName') + ' ' + getVar('lastName');
    });

    def('firstName', user.firstName);
    def('lastName', user.lastName);

    def('currentIndex', function() {
      currentIndex = ++index;

      return currentIndex;
    });

    def('CurrenIndexType', function() {
      return Number;
    });

    it('computes the proper result', function() {
      expect(getVar('personName')).to.equal(user.firstName + ' ' + user.lastName);
    });

    describe('nested suite', function() {
      var user = { firstName: 'Alex' };

      before(function() {
        expect(getVar('currentIndex')).to.equal(cast(currentIndex));
      });

      beforeEach(function usesOwnDefinedVariableInBeforeEachCallbackEvenWhenItIsRunForNestedTests() {
        expect(getVar('currentIndex')).to.equal(cast(currentIndex));
      });

      afterEach(function usesOwnDefinedVariableInAfterEachCallbackEvenWhenItIsRunForNestedTests() {
        expect(getVar('currentIndex')).to.equal(cast(currentIndex));
      });

      after(function usesOwnDefinedVariable() {
        expect(getVar('currentIndex')).to.equal(cast(currentIndex));
      });

      def('firstName', user.firstName);

      def('currentIndex', function() {
        return cast(getVar('currentIndex'));
      });

      def('CurrenIndexType', function() {
        return String;
      });

      it('falls back to parent variable', function() {
        expect(getVar('lastName')).to.equal('Doe');
      });

      it('computes parent variable using redefined variable', function() {
        expect(getVar('personName')).to.equal(user.firstName + ' ' + getVar('lastName'));
      });

      it('can redefine parent variable with the same name and access value of parent variable inside definition', function() {
        expect(getVar('currentIndex')).to.equal(cast(currentIndex));
      });
    });

    function cast(value) {
      var convert = getVar('CurrenIndexType');

      return convert(value);
    }
  });
});
